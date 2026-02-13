import { BaseModel } from "@/lib/models/base-model";
import { sql } from "@/lib/db";

export type CalendarIntegrationRow = {
  user_id: string;
  calendar_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expiry: string | null;
  sync_token: string | null;
  channel_id: string | null;
  resource_id: string | null;
  channel_expiration: number | null;
  updated_at: string;
};

export const calendarIntegrationsModel = new BaseModel<CalendarIntegrationRow>(
  "user_calendar_integrations",
  [
    "user_id",
    "calendar_id",
    "access_token",
    "refresh_token",
    "token_expiry",
    "sync_token",
    "channel_id",
    "resource_id",
    "channel_expiration",
    "updated_at",
  ],
  "user_id"
);

export async function getIntegrationByUserId(userId: string) {
  return calendarIntegrationsModel.findById(userId);
}

export async function getIntegrationByChannelId(channelId: string) {
  const res = await sql.query(
    `SELECT user_id, calendar_id, access_token, refresh_token, token_expiry, sync_token,
            channel_id, resource_id, channel_expiration, updated_at
     FROM user_calendar_integrations
     WHERE channel_id = $1
     LIMIT 1;`,
    [channelId]
  );
  const rows = Array.isArray(res) ? res : (res as any).rows;
  return rows?.[0] ?? null;
}

export async function upsertIntegrationRow(row: Partial<CalendarIntegrationRow> & { user_id: string }) {
  await sql.query(
    `INSERT INTO user_calendar_integrations (
      user_id, calendar_id, access_token, refresh_token, token_expiry, sync_token,
      channel_id, resource_id, channel_expiration, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      calendar_id = COALESCE(EXCLUDED.calendar_id, user_calendar_integrations.calendar_id),
      access_token = COALESCE(EXCLUDED.access_token, user_calendar_integrations.access_token),
      refresh_token = COALESCE(EXCLUDED.refresh_token, user_calendar_integrations.refresh_token),
      token_expiry = COALESCE(EXCLUDED.token_expiry, user_calendar_integrations.token_expiry),
      sync_token = COALESCE(EXCLUDED.sync_token, user_calendar_integrations.sync_token),
      channel_id = COALESCE(EXCLUDED.channel_id, user_calendar_integrations.channel_id),
      resource_id = COALESCE(EXCLUDED.resource_id, user_calendar_integrations.resource_id),
      channel_expiration = COALESCE(EXCLUDED.channel_expiration, user_calendar_integrations.channel_expiration),
      updated_at = NOW();`,
    [
      row.user_id,
      row.calendar_id ?? null,
      row.access_token ?? null,
      row.refresh_token ?? null,
      row.token_expiry ?? null,
      row.sync_token ?? null,
      row.channel_id ?? null,
      row.resource_id ?? null,
      row.channel_expiration ?? null,
    ]
  );
}
