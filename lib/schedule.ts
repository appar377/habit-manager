/**
 * 習慣スケジュールの今日TODO生成（純関数・テスト可能）。
 * 保存はせず、date と habits から「今日のTODO」を計算で返す。
 */

export type ScheduleRule = "daily" | "weekly" | "interval_days";

export type HabitWithSchedule = {
  id: string;
  name: string;
  scheduleEnabled?: boolean;
  scheduleRule?: ScheduleRule;
  scheduleIntervalDays?: number;
  scheduleWeekdays?: number[]; // 0=Sun .. 6=Sat
  scheduleStart?: string; // "HH:MM"
  scheduleEnd?: string; // "HH:MM"
  createdAt?: string; // YYYY-MM-DD（interval_days の基準日。未設定時は "2020-01-01"）
  /** 表示順。小さいほど上。未設定は 99 扱い。 */
  priority?: number;
};

export type TodayTodo = {
  habitId: string;
  title: string;
  start: string;
  end: string;
  priority: number;
};

/** 日付文字列 YYYY-MM-DD を「日」単位の通し番号に変換（基準日との差計算用） */
function dateToDays(iso: string): number {
  const d = new Date(iso + "T00:00:00Z");
  return Math.floor(d.getTime() / 86400000);
}

/**
 * 指定日が習慣のスケジュールに含まれるか。
 * - daily: 毎日 true
 * - weekly: 今日の曜日が scheduleWeekdays に含まれる
 * - interval_days: 基準日（createdAt or "2020-01-01"）から N 日ごと。基準日は「習慣作成日」を想定し、既存習慣は createdAt がないため "2020-01-01" をフォールバック。
 */
export function isDateInSchedule(date: string, habit: HabitWithSchedule): boolean {
  if (!habit.scheduleEnabled || !habit.scheduleRule) return false;
  const rule = habit.scheduleRule;

  if (rule === "daily") return true;

  if (rule === "weekly") {
    const d = new Date(date + "T00:00:00Z");
    const weekday = d.getUTCDay(); // 0=Sun .. 6=Sat
    const weekdays = habit.scheduleWeekdays ?? [];
    return weekdays.length > 0 ? weekdays.includes(weekday) : false;
  }

  if (rule === "interval_days") {
    const base = habit.createdAt ?? "2020-01-01";
    const N = habit.scheduleIntervalDays ?? 1;
    const daysSinceBase = dateToDays(date) - dateToDays(base);
    return daysSinceBase >= 0 && daysSinceBase % N === 0;
  }

  return false;
}

/** 習慣が時間指定されているか（start/end が両方ある） */
export function hasScheduleTime(habit: HabitWithSchedule): boolean {
  const s = habit.scheduleStart?.trim();
  const e = habit.scheduleEnd?.trim();
  return !!(s && e);
}

/**
 * 指定日の習慣TODOを返す（保存しない）。
 * timeSpecified: true = 時間指定ありのみ、false = 時間指定なし＋スケジュールOFF も含む、undefined = 全部。
 */
export function getTodayTodos(
  date: string,
  habits: HabitWithSchedule[],
  options?: { timeSpecified?: boolean }
): TodayTodo[] {
  const todos: TodayTodo[] = [];
  const wantTime = options?.timeSpecified;
  const defaultPriority = 99;
  for (const h of habits) {
    const scheduleOn = !!h.scheduleEnabled;
    const inSchedule = scheduleOn && isDateInSchedule(date, h);
    const withTime = hasScheduleTime(h);

    if (wantTime === true) {
      if (!inSchedule || !withTime) continue;
    } else if (wantTime === false) {
      if (inSchedule && withTime) continue;
      if (scheduleOn && !inSchedule) continue;
    } else {
      if (!inSchedule) continue;
    }

    const start = withTime ? (h.scheduleStart!.trim()) : "00:00";
    const end = withTime ? (h.scheduleEnd!.trim()) : "00:15";
    const priority = h.priority ?? defaultPriority;
    todos.push({ habitId: h.id, title: h.name, start, end, priority });
  }
  todos.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.start.localeCompare(b.start);
  });
  return todos;
}
