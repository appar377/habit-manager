import { NextResponse } from "next/server";
import { getIntegration, upsertIntegration, upsertCalendarEvent, deleteCalendarEvent } from "@/lib/calendar-db";
import { getValidAccessToken } from "@/lib/google-calendar";
import { ensureSchema } from "@/lib/community-db";
import { sql } from "@/lib/db";

function normalizeEventDate(e: any) {
  if (e.dateTime) return new Date(e.dateTime).toISOString();
  if (e.date) return new Date(e.date + "T00:00:00Z").toISOString();
  return null;
}

export async function POST(req: Request) {
  await ensureSchema();
  const channelId = req.headers.get("x-goog-channel-id") ?? "";
  const resourceId = req.headers.get("x-goog-resource-id") ?? "";
  const resourceState = req.headers.get("x-goog-resource-state") ?? "";
  const token = req.headers.get("x-goog-channel-token") ?? "";

  if (!channelId || !resourceId) {
    return NextResponse.json({ ok: true });
  }

  // find integration by channel id
  const rows = (await sql`
    SELECT user_id FROM user_calendar_integrations WHERE channel_id = ${channelId} LIMIT 1;
  `) as { user_id: string }[];
  if (!rows[0]) {
    return NextResponse.json({ ok: true });
  }
  const userId = rows[0].user_id;
  const integration = await getIntegration(userId);
  if (!integration || !integration.calendarId) {
    return NextResponse.json({ ok: true });
  }

  // Optional token check
  if (token && token !== userId) {
    return NextResponse.json({ ok: true });
  }

  if (resourceState === "sync") {
    return NextResponse.json({ ok: true });
  }

  const accessToken = await getValidAccessToken(userId);
  const calendarId = integration.calendarId;
  const params = new URLSearchParams({ singleEvents: "true" });
  if (integration.syncToken) {
    params.set("syncToken", integration.syncToken);
  }

  const listRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!listRes.ok) {
    // invalid sync token -> reset
    await upsertIntegration(userId, { syncToken: null });
    return NextResponse.json({ ok: true });
  }

  const listJson = await listRes.json();
  const items = listJson.items ?? [];
  for (const ev of items) {
    if (ev.status === "cancelled") {
      await deleteCalendarEvent(userId, calendarId, ev.id);
      continue;
    }
    await upsertCalendarEvent({
      id: crypto.randomUUID(),
      userId,
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

  if (listJson.nextSyncToken) {
    await upsertIntegration(userId, { syncToken: listJson.nextSyncToken });
  }

  return NextResponse.json({ ok: true });
}
