// lib/store.ts
import { getFeedbackResult } from "@/lib/feedback";
import { getTodayTodos as getTodayTodosFromSchedule } from "@/lib/schedule";

export type HabitType = "exercise" | "study";

export type ScheduleRule = "daily" | "weekly" | "interval_days";

export type Habit = {
  id: string;
  name: string;
  type: HabitType;
  targetSets?: number;
  targetReps?: number;
  targetMin?: number;
  /** 論理削除。true の習慣は listHabits() で除外（Capture に出さない） */
  archived?: boolean;
  /** スケジュール有効時のみ /plan の今日TODOに出現 */
  scheduleEnabled?: boolean;
  scheduleRule?: ScheduleRule;
  scheduleIntervalDays?: number;
  scheduleWeekdays?: number[]; // 0=Sun..6=Sat
  scheduleStart?: string; // "HH:MM"
  scheduleEnd?: string; // "HH:MM"
  /** interval_days の基準日。未設定時は "2020-01-01" */
  createdAt?: string;
  /** 予定での表示順。小さいほど上（1=最優先）。未設定は 99 扱い。 */
  priority?: number;
};

export type Log = {
  id: string;
  date: string;        // YYYY-MM-DD
  habitId: string;
  sets?: number;
  reps?: number;
  start?: string;      // "HH:MM"
  end?: string;        // "HH:MM"
  durationMin: number; // derived
  volume: number;      // derived sets*reps or 0
};

const uid = () => Math.random().toString(36).slice(2, 10);

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function diffMinutes(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  return Math.max(0, e - s);
}

export const store = {
  habits: [
    { id: "h1", name: "Burpees", type: "exercise", targetSets: 10, targetReps: 25, archived: false },
    { id: "h2", name: "Plank", type: "exercise", targetMin: 5, archived: false },
    { id: "h3", name: "Study", type: "study", targetMin: 90, archived: false },
    // 時間指定あり（ダミー）
    {
      id: "ht1",
      name: "朝ラン",
      type: "exercise",
      targetMin: 30,
      archived: false,
      scheduleEnabled: true,
      scheduleRule: "daily",
      scheduleStart: "06:00",
      scheduleEnd: "06:30",
      priority: 1,
    },
    {
      id: "ht2",
      name: "朝の読書",
      type: "study",
      targetMin: 30,
      archived: false,
      scheduleEnabled: true,
      scheduleRule: "daily",
      scheduleStart: "07:00",
      scheduleEnd: "07:30",
      priority: 2,
    },
    {
      id: "ht3",
      name: "英語学習",
      type: "study",
      targetMin: 60,
      archived: false,
      scheduleEnabled: true,
      scheduleRule: "weekly",
      scheduleWeekdays: [1, 2, 3, 4, 5],
      scheduleStart: "19:00",
      scheduleEnd: "20:00",
      priority: 3,
    },
    {
      id: "ht4",
      name: "夜のストレッチ",
      type: "exercise",
      targetMin: 15,
      archived: false,
      scheduleEnabled: true,
      scheduleRule: "daily",
      scheduleStart: "21:00",
      scheduleEnd: "21:15",
      priority: 4,
    },
    // 時間指定なし（ダミー）
    {
      id: "hn1",
      name: "瞑想",
      type: "study",
      targetMin: 10,
      archived: false,
      scheduleEnabled: true,
      scheduleRule: "daily",
      priority: 1,
    },
    {
      id: "hn2",
      name: "水分補給",
      type: "exercise",
      archived: false,
      scheduleEnabled: true,
      scheduleRule: "daily",
      priority: 2,
    },
  ] as Habit[],
  logs: [
    {
      id: "l1",
      date: todayStr(),
      habitId: "h1",
      sets: 11,
      reps: 25,
      start: "07:00",
      end: "07:20",
      durationMin: 20,
      volume: 275,
    },
  ] as Log[],

  /** 日付 → habitId → { start, end }。Timeline ドラッグ/リサイズで上書き。 */
  planOverrides: {} as Record<string, Record<string, { start: string; end: string }>>,

  /** includeArchived: false ならアーカイブ済みを除外（Capture 用）。true で全件。 */
  listHabits(includeArchived = false) {
    if (includeArchived) return this.habits;
    return this.habits.filter((h) => !h.archived);
  },

  getHabit(id: string): Habit | undefined {
    return this.habits.find((h) => h.id === id);
  },

  addHabit(input: {
    name: string;
    type: HabitType;
    targetSets?: number;
    targetReps?: number;
    targetMin?: number;
    scheduleEnabled?: boolean;
    scheduleRule?: ScheduleRule;
    scheduleIntervalDays?: number;
    scheduleWeekdays?: number[];
    scheduleStart?: string;
    scheduleEnd?: string;
    priority?: number;
  }): Habit {
    const habit: Habit = {
      id: uid(),
      name: input.name.trim(),
      type: input.type,
      targetSets: input.targetSets,
      targetReps: input.targetReps,
      targetMin: input.targetMin,
      archived: false,
      scheduleEnabled: input.scheduleEnabled ?? false,
      scheduleRule: input.scheduleRule,
      scheduleIntervalDays: input.scheduleIntervalDays,
      scheduleWeekdays: input.scheduleWeekdays,
      scheduleStart: input.scheduleStart,
      scheduleEnd: input.scheduleEnd,
      createdAt: todayStr(),
      priority: input.priority,
    };
    this.habits.push(habit);
    return habit;
  },

  updateHabit(
    id: string,
    partial: Partial<
      Pick<
        Habit,
        | "name"
        | "type"
        | "targetSets"
        | "targetReps"
        | "targetMin"
        | "archived"
        | "scheduleEnabled"
        | "scheduleRule"
        | "scheduleIntervalDays"
        | "scheduleWeekdays"
        | "scheduleStart"
        | "scheduleEnd"
        | "priority"
      >
    >
  ): Habit | undefined {
    const habit = this.habits.find((h) => h.id === id);
    if (!habit) return undefined;
    if (partial.name !== undefined) habit.name = partial.name.trim();
    if (partial.type !== undefined) habit.type = partial.type;
    if (partial.targetSets !== undefined) habit.targetSets = partial.targetSets;
    if (partial.targetReps !== undefined) habit.targetReps = partial.targetReps;
    if (partial.targetMin !== undefined) habit.targetMin = partial.targetMin;
    if (partial.archived !== undefined) habit.archived = partial.archived;
    if (partial.scheduleEnabled !== undefined) habit.scheduleEnabled = partial.scheduleEnabled;
    if (partial.scheduleRule !== undefined) habit.scheduleRule = partial.scheduleRule;
    if (partial.scheduleIntervalDays !== undefined)
      habit.scheduleIntervalDays = partial.scheduleIntervalDays;
    if (partial.scheduleWeekdays !== undefined) habit.scheduleWeekdays = partial.scheduleWeekdays;
    if (partial.scheduleStart !== undefined) habit.scheduleStart = partial.scheduleStart;
    if (partial.scheduleEnd !== undefined) habit.scheduleEnd = partial.scheduleEnd;
    if (partial.priority !== undefined) habit.priority = partial.priority;
    return habit;
  },

  /** 今日の習慣TODO（時間指定あり）。スケジュール＋planOverrides をマージ。開始時刻順。 */
  getTodayTodosWithTime(date: string): { habitId: string; title: string; start: string; end: string }[] {
    const habits = this.listHabits(false);
    const base = getTodayTodosFromSchedule(date, habits, { timeSpecified: true });
    const overrides = this.planOverrides[date];
    if (!overrides) return base;
    return base.map((t) => {
      const o = overrides[t.habitId];
      if (!o) return t;
      return { ...t, start: o.start, end: o.end };
    });
  },

  /** 今日の習慣TODO（時間指定なし）。いつでも実行で表示。優先度順。 */
  getTodayTodosWithoutTime(date: string): { habitId: string; title: string; start: string; end: string; priority: number }[] {
    return getTodayTodosFromSchedule(date, this.listHabits(false), { timeSpecified: false });
  },

  /** Timeline で開始/終了を変更したときの上書き保存（メモリのみ）。 */
  setPlanOverride(
    date: string,
    habitId: string,
    override: { start: string; end: string }
  ): void {
    if (!this.planOverrides[date]) this.planOverrides[date] = {};
    this.planOverrides[date][habitId] = { ...override };
  },

  /** 論理削除。Delete の代わり。 */
  archiveHabit(id: string): Habit | undefined {
    const habit = this.habits.find((h) => h.id === id);
    if (!habit) return undefined;
    habit.archived = true;
    return habit;
  },

  /** 習慣の直近7日 vs 前週のトレンド（カード表示用）。exercise: volume, study: durationMin。 */
  habitTrend(habitId: string, habit: Habit): "up" | "down" | "same" {
    const metric = habit.type === "exercise" ? "volume" : "durationMin";
    const series = this.seriesByHabit(habitId, metric, 14);
    const last7 = series.slice(-7).reduce((a, d) => a + d.value, 0);
    const prev7 = series.slice(0, 7).reduce((a, d) => a + d.value, 0);
    if (last7 > prev7) return "up";
    if (last7 < prev7) return "down";
    return "same";
  },

  listLogs(date?: string) {
    if (!date) return this.logs;
    return this.logs.filter((l) => l.date === date);
  },

  addLog(input: {
    date?: string;
    habitId: string;
    sets?: number;
    reps?: number;
    start?: string;
    end?: string;
  }) {
    const date = input.date ?? todayStr();
    const sets = input.sets ?? 0;
    const reps = input.reps ?? 0;
    const durationMin = diffMinutes(input.start, input.end);
    const volume = sets > 0 && reps > 0 ? sets * reps : 0;

    const log: Log = {
      id: uid(),
      date,
      habitId: input.habitId,
      sets: sets || undefined,
      reps: reps || undefined,
      start: input.start || undefined,
      end: input.end || undefined,
      durationMin,
      volume,
    };
    this.logs.unshift(log);
    return log;
  },

  /** 指定日の該当習慣ログをすべて削除（/plan のチェック解除用）。削除件数を返す。 */
  deleteLogByHabitAndDate(habitId: string, date: string): number {
    const before = this.logs.length;
    this.logs = this.logs.filter((l) => !(l.habitId === habitId && l.date === date));
    return before - this.logs.length;
  },

  /**
   * 記録直後のフィードバック用。今回追加したログと「同習慣の直近1件前」を比較。
   * 判定ロジックは lib/feedback.getFeedbackResult（テストケース: lib/feedback.test-cases.ts）
   */
  getFeedback(newLog: Log, habit: Habit): "up" | "down" | "same" {
    const prev = this.logs.slice(1).find((l) => l.habitId === newLog.habitId);
    return getFeedbackResult(newLog, prev ?? null, habit);
  },

  // review 用：日別合計（volume or duration）を返す
  series(metric: "volume" | "durationMin", days = 7) {
    const out: { date: string; value: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const date = `${yyyy}-${mm}-${dd}`;
      const value = this.logs
        .filter((l) => l.date === date)
        .reduce((acc, l) => acc + (l[metric] ?? 0), 0);
      out.push({ date, value });
    }
    return out;
  },

  /** 習慣別の日別合計（review の習慣別サマリ用）。直近 days 日分。 */
  seriesByHabit(habitId: string, metric: "volume" | "durationMin", days = 14) {
    const out: { date: string; value: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const date = `${yyyy}-${mm}-${dd}`;
      const value = this.logs
        .filter((l) => l.date === date && l.habitId === habitId)
        .reduce((acc, l) => acc + (l[metric] ?? 0), 0);
      out.push({ date, value });
    }
    return out;
  },
};
