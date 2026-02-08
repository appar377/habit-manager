export function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** YYYY-MM-DD をパース。無効なら null。 */
export function parseDate(dateStr: string): Date | null {
  if (!ISO_DATE.test(dateStr)) return null;
  const d = new Date(dateStr + "T12:00:00Z");
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 日付に n 日を加算した YYYY-MM-DD。 */
export function addDays(dateStr: string, delta: number): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  d.setUTCDate(d.getUTCDate() + delta);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 日付に n ヶ月を加算した YYYY-MM-DD。日が存在しない月は月末にする。 */
export function addMonths(dateStr: string, delta: number): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + delta);
  const maxDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, maxDay));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const DAY_LABELS_JA = ["日", "月", "火", "水", "木", "金", "土"];

/** 指定日（YYYY-MM-DD）の曜日をローカルで取得。例: "月" */
export function getDayOfWeekJa(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return "";
  const [y, m, day] = parts;
  const local = new Date(y, m - 1, day);
  return DAY_LABELS_JA[local.getDay()] ?? "";
}

/** 表示用: 2月1日 または 2025年2月1日（年が違う場合）。withWeekday: true で「2月1日(月)」 */
export function formatDateJa(dateStr: string, baseYear?: number, withWeekday?: boolean): string {
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const currentYear = baseYear ?? new Date().getFullYear();
  const base = y === currentYear ? `${m}月${day}日` : `${y}年${m}月${day}日`;
  if (withWeekday) {
    const w = getDayOfWeekJa(dateStr);
    return w ? `${base}(${w})` : base;
  }
  return base;
}

/** 指定日を含む週の日曜〜土曜の YYYY-MM-DD を返す（日曜始まり）。 */
export function getWeekDates(dateStr: string): string[] {
  const d = parseDate(dateStr);
  if (!d) return [];
  const day = d.getUTCDay();
  const start = addDays(dateStr, -day);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** 指定年月のカレンダー用セル（空きは null、日付は YYYY-MM-DD）。日曜始まり。 */
export function getMonthCells(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0));
  const startPad = first.getUTCDay();
  const daysInMonth = last.getUTCDate();
  const result: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) result.push(null);
  const mm = String(month).padStart(2, "0");
  for (let d = 1; d <= daysInMonth; d++) {
    result.push(`${year}-${mm}-${String(d).padStart(2, "0")}`);
  }
  return result;
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
