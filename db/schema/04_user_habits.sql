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
