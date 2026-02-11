import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/community-db";

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
  const rows = (await sql`
    SELECT user_id, calendar_id, access_token, refresh_token, token_expiry, sync_token,
           channel_id, resource_id, channel_expiration
    FROM user_calendar_integrations
    WHERE user_id = ${userId}
    LIMIT 1;
  `) as {
    user_id: string;
    calendar_id: string | null;
    access_token: string | null;
    refresh_token: string | null;
    token_expiry: string | null;
    sync_token: string | null;
    channel_id: string | null;
    resource_id: string | null;
    channel_expiration: number | null;
  }[];
  if (!rows[0]) return null;
  return {
    userId: rows[0].user_id,
    calendarId: rows[0].calendar_id,
    accessToken: rows[0].access_token,
    refreshToken: rows[0].refresh_token,
    tokenExpiry: rows[0].token_expiry,
    syncToken: rows[0].sync_token,
    channelId: rows[0].channel_id,
    resourceId: rows[0].resource_id,
    channelExpiration: rows[0].channel_expiration,
  };
}

export async function upsertIntegration(userId: string, patch: Partial<CalendarIntegration>) {
  await ensureSchema();
  await sql`
    INSERT INTO user_calendar_integrations (
      user_id, calendar_id, access_token, refresh_token, token_expiry, sync_token,
      channel_id, resource_id, channel_expiration, updated_at
    )
    VALUES (
      ${userId},
      ${patch.calendarId ?? null},
      ${patch.accessToken ?? null},
      ${patch.refreshToken ?? null},
      ${patch.tokenExpiry ?? null},
      ${patch.syncToken ?? null},
      ${patch.channelId ?? null},
      ${patch.resourceId ?? null},
      ${patch.channelExpiration ?? null},
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      calendar_id = COALESCE(EXCLUDED.calendar_id, user_calendar_integrations.calendar_id),
      access_token = COALESCE(EXCLUDED.access_token, user_calendar_integrations.access_token),
      refresh_token = COALESCE(EXCLUDED.refresh_token, user_calendar_integrations.refresh_token),
      token_expiry = COALESCE(EXCLUDED.token_expiry, user_calendar_integrations.token_expiry),
      sync_token = COALESCE(EXCLUDED.sync_token, user_calendar_integrations.sync_token),
      channel_id = COALESCE(EXCLUDED.channel_id, user_calendar_integrations.channel_id),
      resource_id = COALESCE(EXCLUDED.resource_id, user_calendar_integrations.resource_id),
      channel_expiration = COALESCE(EXCLUDED.channel_expiration, user_calendar_integrations.channel_expiration),
      updated_at = NOW();
  `;
}

export type CalendarEventRow = {
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

export async function upsertCalendarEvent(event: CalendarEventRow) {
  await ensureSchema();
  await sql`
    INSERT INTO user_calendar_events (
      id, user_id, calendar_id, event_id, summary, start_time, end_time, status, location, html_link, updated_at
    )
    VALUES (
      ${event.id}, ${event.userId}, ${event.calendarId}, ${event.eventId}, ${event.summary},
      ${event.startTime}, ${event.endTime}, ${event.status}, ${event.location}, ${event.htmlLink}, NOW()
    )
    ON CONFLICT (user_id, calendar_id, event_id) DO UPDATE SET
      summary = EXCLUDED.summary,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      status = EXCLUDED.status,
      location = EXCLUDED.location,
      html_link = EXCLUDED.html_link,
      updated_at = NOW();
  `;
}

export async function deleteCalendarEvent(userId: string, calendarId: string, eventId: string) {
  await ensureSchema();
  await sql`
    DELETE FROM user_calendar_events WHERE user_id = ${userId} AND calendar_id = ${calendarId} AND event_id = ${eventId};
  `;
}

export async function listCalendarEventsByDate(userId: string, date: string) {
  await ensureSchema();
  const rows = (await sql`
    SELECT id, user_id, calendar_id, event_id, summary, start_time, end_time, status, location, html_link
    FROM user_calendar_events
    WHERE user_id = ${userId}
      AND start_time::date = ${date}
    ORDER BY start_time ASC;
  `) as {
    id: string;
    user_id: string;
    calendar_id: string;
    event_id: string;
    summary: string | null;
    start_time: string | null;
    end_time: string | null;
    status: string | null;
    location: string | null;
    html_link: string | null;
  }[];
  return rows.map((r) => ({
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
