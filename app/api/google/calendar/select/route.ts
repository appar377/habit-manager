import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { getValidAccessToken } from "@/lib/google-calendar";
import { getGoogleConfig } from "@/lib/google";
import { upsertIntegration, upsertCalendarEvent, deleteCalendarEvent } from "@/lib/calendar-db";

function toIsoDateTime(input?: string) {
  if (!input) return null;
  return new Date(input).toISOString();
}

function normalizeEventDate(e: any) {
  if (e.dateTime) return new Date(e.dateTime).toISOString();
  if (e.date) return new Date(e.date + "T00:00:00Z").toISOString();
  return null;
}

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  const body = await req.json().catch(() => ({}));
  const calendarId = typeof body.calendarId === "string" ? body.calendarId : "";
  if (!calendarId) {
    return NextResponse.json({ error: "calendar_id_required" }, { status: 400 });
  }

  const token = await getValidAccessToken(user.id);
  const { webhookBaseUrl } = getGoogleConfig();
  const channelId = crypto.randomUUID();
  const expiration = Date.now() + 1000 * 60 * 60 * 24 * 6; // ~6 days

  const watchRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/watch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: channelId,
      type: "web_hook",
      address: `${webhookBaseUrl}/api/google/webhook`,
      token: user.id,
      expiration: String(expiration),
    }),
  });

  if (!watchRes.ok) {
    return NextResponse.json({ error: "watch_failed" }, { status: 400 });
  }
  const watchJson = await watchRes.json();

  // initial full sync (last 30 days to next 90 days)
  const timeMin = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
  const timeMax = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString();
  let pageToken: string | undefined;
  let nextSyncToken: string | undefined;

  do {
    const params = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      timeMin,
      timeMax,
      maxResults: "2500",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const listRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!listRes.ok) {
      return NextResponse.json({ error: "initial_sync_failed" }, { status: 400 });
    }
    const listJson = await listRes.json();
    const items = listJson.items ?? [];
    for (const ev of items) {
      if (ev.status === "cancelled") {
        await deleteCalendarEvent(user.id, calendarId, ev.id);
        continue;
      }
      await upsertCalendarEvent({
        id: crypto.randomUUID(),
        userId: user.id,
        calendarId,
        eventId: ev.id,
        summary: ev.summary ?? null,
        startTime: normalizeEventDate(ev.start),
        endTime: normalizeEventDate(ev.end),
        status: ev.status ?? null,
        location: ev.location ?? null,
        htmlLink: ev.htmlLink ?? null,
      });
    }
    pageToken = listJson.nextPageToken;
    nextSyncToken = listJson.nextSyncToken ?? nextSyncToken;
  } while (pageToken);

  await upsertIntegration(user.id, {
    calendarId,
    channelId,
    resourceId: watchJson.resourceId ?? null,
    channelExpiration: expiration,
    syncToken: nextSyncToken ?? null,
  });

  return NextResponse.json({ ok: true });
}
