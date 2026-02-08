export function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** 今週合計 vs 前週合計でトレンド（良し悪しは評価しない） */
export function getTrend(
  thisPeriod: number,
  lastPeriod: number
): "up" | "down" | "same" {
  if (thisPeriod > lastPeriod) return "up";
  if (thisPeriod < lastPeriod) return "down";
  return "same";
}

/** 直近のログで使われた習慣を上に並べる（よく使う習慣を優先表示） */
export function sortHabitsByRecentUsage<T extends { id: string }>(
  habits: T[],
  logs: { habitId: string }[]
): T[] {
  const order = [...new Set(logs.map((l) => l.habitId))];
  return [...habits].sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}
