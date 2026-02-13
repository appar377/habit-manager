CREATE TABLE IF NOT EXISTS user_calendar_integrations (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  calendar_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  sync_token TEXT,
  channel_id TEXT,
  resource_id TEXT,
  channel_expiration BIGINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
