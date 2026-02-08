// lib/store.ts
import { getFeedbackResult } from "@/lib/feedback";
import { getTodayTodos as getTodayTodosFromSchedule, isDateInSchedule } from "@/lib/schedule";

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

/** チートデイ設定。null は未選択（初回オンボーディング用）。 */
export type CheatDayConfig = {
  cycleDays: number;
  requiredAchievementPercent: number;
  /** 表示用ラベル（例: "週1回（標準）"） */
  label: string;
  /** 表示用説明 */
  description: string;
};

/** 研究に基づいたチートデイ周期プリセット（計画的な逸脱はアドヒアランス向上と報告）。 */
export const CHEAT_DAY_PRESETS: CheatDayConfig[] = [
  {
    cycleDays: 7,
    requiredAchievementPercent: 70,
    label: "週1回（ゆるめ）",
    description: "7日間で達成率70%以上を維持すると1日解禁。初心者向け。",
  },
  {
    cycleDays: 7,
    requiredAchievementPercent: 80,
    label: "週1回（標準）",
    description: "7日間で達成率80%以上を維持すると1日解禁。研究で週1の計画的な逸脱でアドヒアランス向上が報告されています。",
  },
  {
    cycleDays: 14,
    requiredAchievementPercent: 80,
    label: "2週に1回",
    description: "14日間で達成率80%を維持すると1日解禁。2週オン・オフに近い周期です。",
  },
  {
    cycleDays: 21,
    requiredAchievementPercent: 85,
    label: "3週に1回（厳しめ）",
    description: "21日間で達成率85%以上を維持すると1日解禁。長めのサイクル向け。",
  },
];

/** ランキング用：自分と比べる相手。数値は未入力なら null（非表示）。 */
export type Rival = {
  id: string;
  name: string;
  /** 記録ストリーク（日） */
  logStreak?: number;
  /** 達成ストリーク（日） */
  planStreak?: number;
  /** 立ち上がり回数 */
  comebackCount?: number;
  /** 直近7日達成率（0〜1）。未入力なら null */
  achievementRate?: number;
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

  /** チートデイ設定。null のときは未選択（オンボーディングで選択させる）。 */
  cheatDayConfig: null as CheatDayConfig | null,
  /** チートデイを使用した日付（YYYY-MM-DD）の配列。この日はストリーク計算で「達成」扱い。 */
  cheatDaysUsed: [] as string[],

  /** ランキング用：自分と比べる相手の一覧。 */
  rivals: [] as Rival[],

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

  /** 今日を含む「ログが1件以上ある日」またはチートデイ使用日の連続日数。0＝今日はまだログなしかつチートデイ未使用。 */
  getStreakDays(): number {
    const loggedDates = new Set(this.logs.map((l) => l.date));
    const cheatSet = new Set(this.cheatDaysUsed);
    const oneDayMs = 86400000;
    let count = 0;
    let t = new Date(todayStr() + "T00:00:00Z").getTime();
    while (loggedDates.has(new Date(t).toISOString().slice(0, 10)) || cheatSet.has(new Date(t).toISOString().slice(0, 10))) {
      count++;
      t -= oneDayMs;
    }
    return count;
  },

  /**
   * 七転び八起き：ストリークが途切れたあと「また記録を再開した」回数。
   * 前日に記録がなく、その日に記録（またはチートデイ）があった日を「立ち上がり」として数える。
   */
  getLogComebackCount(): number {
    const loggedDates = new Set(this.logs.map((l) => l.date));
    const cheatSet = new Set(this.cheatDaysUsed);
    const activeDates = new Set<string>([...loggedDates, ...cheatSet]);
    if (activeDates.size === 0) return 0;
    const sorted = [...activeDates].sort();
    const first = sorted[0];
    const today = todayStr();
    const oneDayMs = 86400000;
    let count = 0;
    let t = new Date(first + "T00:00:00Z").getTime();
    const end = new Date(today + "T23:59:59Z").getTime();
    let prevActive = false;
    while (t <= end) {
      const d = new Date(t).toISOString().slice(0, 10);
      const active = loggedDates.has(d) || cheatSet.has(d);
      if (active && !prevActive) count++;
      prevActive = active;
      t += oneDayMs;
    }
    return count;
  },

  /** 指定日の予定達成サマリ（スケジュール上のTODO数と、ログで完了した数）。 */
  getDayPlanSummary(date: string): { scheduled: number; completed: number; rate: number } {
    const habits = this.listHabits(false);
    const todos = getTodayTodosFromSchedule(date, habits, {});
    const scheduled = todos.length;
    const completedHabitIds = new Set(this.listLogs(date).map((l) => l.habitId));
    const completed = todos.filter((t) => completedHabitIds.has(t.habitId)).length;
    const rate = scheduled > 0 ? completed / scheduled : 0;
    return { scheduled, completed, rate };
  },

  /** 予定100%達成の連続日数（今日から遡る）。予定が0件の日はスキップ。チートデイ使用日は達成扱い。 */
  getPlanStreakDays(): number {
    const cheatSet = new Set(this.cheatDaysUsed);
    const oneDayMs = 86400000;
    let count = 0;
    let t = new Date(todayStr() + "T00:00:00Z").getTime();
    for (;;) {
      const dateStr = new Date(t).toISOString().slice(0, 10);
      const s = this.getDayPlanSummary(dateStr);
      if (s.scheduled === 0) break;
      const countedAsAchieved = s.rate >= 1 || cheatSet.has(dateStr);
      if (!countedAsAchieved) break;
      count++;
      t -= oneDayMs;
    }
    return count;
  },

  /** 習慣の直近 days 日間の達成率（スケジュールに入っていた日のうちログがあった日）。 */
  getHabitAchievementRate(habitId: string, days: number): { scheduledDays: number; completedDays: number; rate: number } {
    const habit = this.getHabit(habitId);
    if (!habit) return { scheduledDays: 0, completedDays: 0, rate: 0 };
    const oneDayMs = 86400000;
    let scheduledDays = 0;
    let completedDays = 0;
    let t = new Date(todayStr() + "T00:00:00Z").getTime();
    for (let i = 0; i < days; i++) {
      const dateStr = new Date(t).toISOString().slice(0, 10);
      if (isDateInSchedule(dateStr, habit)) {
        scheduledDays++;
        if (this.listLogs(dateStr).some((l) => l.habitId === habitId)) completedDays++;
      }
      t -= oneDayMs;
    }
    const rate = scheduledDays > 0 ? completedDays / scheduledDays : 0;
    return { scheduledDays, completedDays, rate };
  },

  /** 直近 days 日分の日別達成率（日付・予定数・完了数・率）。 */
  getDailyAchievementRates(days: number): { date: string; scheduled: number; completed: number; rate: number }[] {
    const oneDayMs = 86400000;
    let t = new Date(todayStr() + "T00:00:00Z").getTime();
    const result: { date: string; scheduled: number; completed: number; rate: number }[] = [];
    for (let i = 0; i < days; i++) {
      const dateStr = new Date(t).toISOString().slice(0, 10);
      const s = this.getDayPlanSummary(dateStr);
      result.push({ date: dateStr, ...s });
      t -= oneDayMs;
    }
    return result;
  },

  /** チートデイの解禁状態。設定未選択時は null。 */
  getCheatDayStatus(): {
    unlocked: boolean;
    cycleAchievementRate: number;
    periodDaysWithSchedule: number;
    requiredPercent: number;
    usedInPeriod: boolean;
    periodStart: string;
    periodEnd: string;
  } | null {
    const cfg = this.cheatDayConfig;
    if (!cfg) return null;
    const oneDayMs = 86400000;
    let t = new Date(todayStr() + "T00:00:00Z").getTime();
    let sumRate = 0;
    let daysWithSchedule = 0;
    let periodStart = "";
    let periodEnd = "";
    for (let i = 0; i < cfg.cycleDays; i++) {
      const dateStr = new Date(t).toISOString().slice(0, 10);
      if (i === 0) periodEnd = dateStr;
      if (i === cfg.cycleDays - 1) periodStart = dateStr;
      const s = this.getDayPlanSummary(dateStr);
      if (s.scheduled > 0) {
        daysWithSchedule++;
        sumRate += s.rate;
      }
      t -= oneDayMs;
    }
    const cycleAchievementRate = daysWithSchedule > 0 ? sumRate / daysWithSchedule : 0;
    const required = cfg.requiredAchievementPercent / 100;
    const usedInPeriod = this.cheatDaysUsed.some((d) => d >= periodStart && d <= periodEnd);
    const unlocked = cycleAchievementRate >= required && !usedInPeriod;
    return {
      unlocked,
      cycleAchievementRate,
      periodDaysWithSchedule: daysWithSchedule,
      requiredPercent: cfg.requiredAchievementPercent,
      usedInPeriod,
      periodStart,
      periodEnd,
    };
  },

  setCheatDayConfig(config: CheatDayConfig): void {
    this.cheatDayConfig = config;
  },

  /** 指定日をチートデイとして使用（その日はストリークで達成扱い）。 */
  useCheatDay(date: string): void {
    if (!this.cheatDaysUsed.includes(date)) this.cheatDaysUsed.push(date);
  },

  getCheatDayPresets(): CheatDayConfig[] {
    return CHEAT_DAY_PRESETS;
  },

  listRivals(): Rival[] {
    return this.rivals;
  },

  addRival(input: { name: string; logStreak?: number; planStreak?: number; comebackCount?: number; achievementRate?: number }): Rival {
    const rival: Rival = {
      id: uid(),
      name: input.name.trim(),
      logStreak: input.logStreak,
      planStreak: input.planStreak,
      comebackCount: input.comebackCount,
      achievementRate: input.achievementRate,
    };
    this.rivals.push(rival);
    return rival;
  },

  updateRival(id: string, input: Partial<Pick<Rival, "name" | "logStreak" | "planStreak" | "comebackCount" | "achievementRate">>): Rival | undefined {
    const r = this.rivals.find((x) => x.id === id);
    if (!r) return undefined;
    if (input.name !== undefined) r.name = input.name.trim();
    if (input.logStreak !== undefined) r.logStreak = input.logStreak;
    if (input.planStreak !== undefined) r.planStreak = input.planStreak;
    if (input.comebackCount !== undefined) r.comebackCount = input.comebackCount;
    if (input.achievementRate !== undefined) r.achievementRate = input.achievementRate;
    return r;
  },

  removeRival(id: string): boolean {
    const before = this.rivals.length;
    this.rivals = this.rivals.filter((x) => x.id !== id);
    return this.rivals.length < before;
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
