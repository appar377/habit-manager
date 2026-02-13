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
