import type { Habit, Log } from "@/lib/store";

/**
 * 記録直後フィードバックの判定（純粋関数・テスト用）。
 * 今回ログと同習慣の「直近1件前」を比較。exercise: volume, study: durationMin。
 */
export function getFeedbackResult(
  newLog: Log,
  prevLog: Log | null,
  habit: Habit
): "up" | "down" | "same" {
  if (!prevLog) return "same";
  const metric = habit.type === "exercise" ? "volume" : "durationMin";
  const thisVal = newLog[metric] ?? 0;
  const prevVal = prevLog[metric] ?? 0;
  if (thisVal > prevVal) return "up";
  if (thisVal < prevVal) return "down";
  return "same";
}
