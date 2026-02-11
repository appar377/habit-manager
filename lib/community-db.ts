import { sql } from "@/lib/db";

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      friend_code TEXT NOT NULL UNIQUE,
      secret TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      log_streak INT NOT NULL DEFAULT 0,
      plan_streak INT NOT NULL DEFAULT 0,
      comeback_count INT NOT NULL DEFAULT 0,
      achievement_rate REAL NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS user_friends (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, friend_id)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS user_habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      target_sets INT,
      target_reps INT,
      target_min INT,
      archived BOOLEAN NOT NULL DEFAULT FALSE,
      priority INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS user_schedules (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL REFERENCES user_habits(id) ON DELETE CASCADE,
      rule TEXT NOT NULL,
      interval_days INT,
      weekdays INT[],
      start_time TEXT,
      end_time TEXT,
      enabled BOOLEAN NOT NULL DEFAULT FALSE
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS user_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      habit_id TEXT NOT NULL REFERENCES user_habits(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      duration_min INT NOT NULL DEFAULT 0,
      volume INT NOT NULL DEFAULT 0
    );
  `;
  await sql`
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
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS user_calendar_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      calendar_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      summary TEXT,
      start_time TIMESTAMPTZ,
      end_time TIMESTAMPTZ,
      status TEXT,
      location TEXT,
      html_link TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, calendar_id, event_id)
    );
  `;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateFriendCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function createUniqueFriendCode(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = generateFriendCode();
    const exists = (await sql`SELECT 1 FROM users WHERE friend_code = ${code} LIMIT 1;`) as { "?column?": number }[];
    if (exists.length === 0) return code;
  }
  return generateFriendCode();
}

export function normalizeFriendCode(code: string): string {
  return code.trim().toUpperCase();
}
