CREATE TABLE IF NOT EXISTS user_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id TEXT NOT NULL REFERENCES user_habits(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  sets INT,
  reps INT,
  start_time TEXT,
  end_time TEXT,
  duration_min INT NOT NULL DEFAULT 0,
  volume INT NOT NULL DEFAULT 0
);
