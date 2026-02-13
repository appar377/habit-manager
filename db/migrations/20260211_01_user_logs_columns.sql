ALTER TABLE user_logs ADD COLUMN IF NOT EXISTS sets INT;
ALTER TABLE user_logs ADD COLUMN IF NOT EXISTS reps INT;
ALTER TABLE user_logs ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE user_logs ADD COLUMN IF NOT EXISTS end_time TEXT;

UPDATE user_logs
SET start_time = start
WHERE start_time IS NULL AND start IS NOT NULL;

UPDATE user_logs
SET end_time = "end"
WHERE end_time IS NULL AND "end" IS NOT NULL;

ALTER TABLE user_logs DROP COLUMN IF EXISTS start;
ALTER TABLE user_logs DROP COLUMN IF EXISTS "end";
