import { ensureSchema } from "@/lib/community-db";
import {
  getIntegrationByUserId,
  upsertIntegrationRow,
} from "@/lib/models/user-calendar-integrations";
import {
  type CalendarEventRow,
  upsertCalendarEventRow,
  deleteCalendarEventRow,
  listCalendarEventsByDateRow,
} from "@/lib/models/user-calendar-events";

export type CalendarIntegration = {
  userId: string;
  calendarId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: string | null;
  syncToken: string | null;
  channelId: string | null;
  resourceId: string | null;
  channelExpiration: number | null;
};

export async function getIntegration(userId: string): Promise<CalendarIntegration | null> {
  await ensureSchema();
  const row = await getIntegrationByUserId(userId);
  if (!row) return null;
  return {
    userId: row.user_id,
    calendarId: row.calendar_id,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    tokenExpiry: row.token_expiry,
    syncToken: row.sync_token,
    channelId: row.channel_id,
    resourceId: row.resource_id,
    channelExpiration: row.channel_expiration,
  };
}

export async function upsertIntegration(userId: string, patch: Partial<CalendarIntegration>) {
  await ensureSchema();
  await upsertIntegrationRow({
    user_id: userId,
    calendar_id: patch.calendarId ?? null,
    access_token: patch.accessToken ?? null,
    refresh_token: patch.refreshToken ?? null,
    token_expiry: patch.tokenExpiry ?? null,
    sync_token: patch.syncToken ?? null,
    channel_id: patch.channelId ?? null,
    resource_id: patch.resourceId ?? null,
    channel_expiration: patch.channelExpiration ?? null,
  });
}

/** camelCase の入力用。DB の CalendarEventRow (snake_case) とは別 */
export type CalendarEventInput = {
  id: string;
  userId: string;
  calendarId: string;
  eventId: string;
  summary: string | null;
  startTime: string | null;
  endTime: string | null;
  status: string | null;
  location: string | null;
  htmlLink: string | null;
};

export async function upsertCalendarEvent(event: CalendarEventInput) {
  await ensureSchema();
  await upsertCalendarEventRow({
    id: event.id,
    user_id: event.userId,
    calendar_id: event.calendarId,
    event_id: event.eventId,
    summary: event.summary,
    start_time: event.startTime,
    end_time: event.endTime,
    status: event.status,
    location: event.location,
    html_link: event.htmlLink,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteCalendarEvent(userId: string, calendarId: string, eventId: string) {
  await ensureSchema();
  await deleteCalendarEventRow(userId, calendarId, eventId);
}

export async function listCalendarEventsByDate(userId: string, date: string) {
  await ensureSchema();
  const rows = await listCalendarEventsByDateRow(userId, date);
  return rows.map((r: CalendarEventRow) => ({
    id: r.id,
    userId: r.user_id,
    calendarId: r.calendar_id,
    eventId: r.event_id,
    summary: r.summary,
    startTime: r.start_time,
    endTime: r.end_time,
    status: r.status,
    location: r.location,
    htmlLink: r.html_link,
  }));
}
