import { BaseModel } from "@/lib/models/base-model";
import { sql } from "@/lib/db";

export type CalendarEventRow = {
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
  updated_at: string;
};

export const calendarEventsModel = new BaseModel<CalendarEventRow>(
  "user_calendar_events",
  [
    "id",
    "user_id",
    "calendar_id",
    "event_id",
    "summary",
    "start_time",
    "end_time",
    "status",
    "location",
    "html_link",
    "updated_at",
  ]
);

export async function upsertCalendarEventRow(row: CalendarEventRow) {
  await sql.query(
    `INSERT INTO user_calendar_events (
      id, user_id, calendar_id, event_id, summary, start_time, end_time, status, location, html_link, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    ON CONFLICT (user_id, calendar_id, event_id) DO UPDATE SET
      summary = EXCLUDED.summary,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      status = EXCLUDED.status,
      location = EXCLUDED.location,
      html_link = EXCLUDED.html_link,
      updated_at = NOW();`,
    [
      row.id,
      row.user_id,
      row.calendar_id,
      row.event_id,
      row.summary,
      row.start_time,
      row.end_time,
      row.status,
      row.location,
      row.html_link,
    ]
  );
}

export async function deleteCalendarEventRow(userId: string, calendarId: string, eventId: string) {
  await sql.query(
    "DELETE FROM user_calendar_events WHERE user_id = $1 AND calendar_id = $2 AND event_id = $3;",
    [userId, calendarId, eventId]
  );
}

export async function listCalendarEventsByDateRow(userId: string, date: string) {
  const res = await sql.query(
    `SELECT id, user_id, calendar_id, event_id, summary, start_time, end_time, status, location, html_link, updated_at
     FROM user_calendar_events
     WHERE user_id = $1 AND start_time::date = $2
     ORDER BY start_time ASC;`,
    [userId, date]
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows ?? [];
}
