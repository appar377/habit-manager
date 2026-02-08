/**
 * 時刻 "HH:MM" と分換算・15分スナップ用ユーティリティ。
 * Timeline のドラッグ・リサイズで使用。
 */

export const MINUTES_PER_SLOT = 15;
export const MIN_DURATION_MIN = 15;

/** 00:00 からの分数に変換（0〜24*60）。24:00 は終了として 1440。 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  const total = h * 60 + m;
  return Math.max(0, Math.min(24 * 60, total));
}

/** 分数を "HH:MM" に変換。1440 は "24:00"。 */
export function minutesToTime(min: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.floor(min)));
  if (clamped === 24 * 60) return "24:00";
  const h = Math.floor(clamped / 60);
  const mm = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** 15分単位にスナップ（切り捨て） */
export function snapTo15(min: number): number {
  const slot = Math.floor(min / MINUTES_PER_SLOT) * MINUTES_PER_SLOT;
  return Math.max(0, Math.min(24 * 60, slot));
}

/** 15分単位にスナップ（四捨五入） */
export function roundTo15(min: number): number {
  const slot = Math.round(min / MINUTES_PER_SLOT) * MINUTES_PER_SLOT;
  return Math.max(0, Math.min(24 * 60, slot));
}

/** start/end から長さ（分）を算出。最小 MIN_DURATION_MIN。 */
export function durationMinutes(start: string, end: string): number {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return Math.max(MIN_DURATION_MIN, e - s);
}

/** 開始時刻 + 分 → 終了時刻 */
export function addMinutes(time: string, deltaMin: number): string {
  return minutesToTime(timeToMinutes(time) + deltaMin);
}

/** "HH:MM" を15分単位に丸めて返す（フォーム初期値・保存用） */
export function roundTimeTo15(time: string): string {
  return minutesToTime(roundTo15(timeToMinutes(time)));
}

/** 終了時刻を「開始＋最低15分」に正規化。15分未満には縮めない。 */
export function clampEndToMinDuration(
  start: string,
  end: string
): { start: string; end: string } {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const minEndMin = startMin + MIN_DURATION_MIN;
  if (endMin >= minEndMin) return { start, end };
  return {
    start,
    end: minutesToTime(roundTo15(minEndMin)),
  };
}

/** 15分刻みの時刻オプション（00:00 〜 23:45）。フォームの開始用。 */
export function getTimeOptions15(): string[] {
  const options: string[] = [];
  for (let min = 0; min < 24 * 60; min += MINUTES_PER_SLOT) {
    options.push(minutesToTime(min));
  }
  return options;
}

/** 開始時刻より後の15分刻みオプションのみ（開始＋15分〜）。フォームの終了用。 */
export function getEndTimeOptions15(start: string): string[] {
  const startMin = timeToMinutes(roundTimeTo15(start));
  const minEndMin = startMin + MIN_DURATION_MIN;
  const options: string[] = [];
  for (let min = minEndMin; min < 24 * 60; min += MINUTES_PER_SLOT) {
    options.push(minutesToTime(min));
  }
  if (minEndMin <= 24 * 60) options.push("24:00");
  return options;
}
