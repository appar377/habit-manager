/**
 * スケジュール生成ロジックのテストケース。
 * isDateInSchedule / getTodayTodos の例: weekly, interval_days, daily。
 */
import { getTodayTodos, isDateInSchedule, type HabitWithSchedule } from "./schedule";

const baseHabit: HabitWithSchedule = {
  id: "h1",
  name: "Test",
  scheduleEnabled: true,
  scheduleStart: "09:00",
  scheduleEnd: "10:00",
};

export const SCHEDULE_TEST_CASES: {
  description: string;
  habit: HabitWithSchedule;
  date: string;
  expected: boolean;
}[] = [
  {
    description: "scheduleEnabled false → 常に false",
    habit: { ...baseHabit, scheduleEnabled: false, scheduleRule: "daily" },
    date: "2025-02-01",
    expected: false,
  },
  {
    description: "daily: 任意の日で true",
    habit: { ...baseHabit, scheduleRule: "daily" },
    date: "2025-02-01",
    expected: true,
  },
  {
    description: "weekly: 今日が土曜(6)で scheduleWeekdays に 6 が含まれる → true",
    habit: {
      ...baseHabit,
      scheduleRule: "weekly",
      scheduleWeekdays: [0, 6],
    },
    date: "2025-02-01", // 土曜
    expected: true,
  },
  {
    description: "weekly: 今日が土曜で scheduleWeekdays が [1,2,3,4,5] のみ → false",
    habit: {
      ...baseHabit,
      scheduleRule: "weekly",
      scheduleWeekdays: [1, 2, 3, 4, 5],
    },
    date: "2025-02-01", // 土曜
    expected: false,
  },
  {
    description: "interval_days: 基準日と同じ日 → true",
    habit: {
      ...baseHabit,
      scheduleRule: "interval_days",
      scheduleIntervalDays: 2,
      createdAt: "2025-01-30",
    },
    date: "2025-01-30",
    expected: true,
  },
  {
    description: "interval_days: 基準日+2日（2日ごと）→ true",
    habit: {
      ...baseHabit,
      scheduleRule: "interval_days",
      scheduleIntervalDays: 2,
      createdAt: "2025-01-30",
    },
    date: "2025-02-01",
    expected: true,
  },
  {
    description: "interval_days: 基準日+1日（2日ごと）→ false",
    habit: {
      ...baseHabit,
      scheduleRule: "interval_days",
      scheduleIntervalDays: 2,
      createdAt: "2025-01-30",
    },
    date: "2025-01-31",
    expected: false,
  },
  {
    description: "interval_days: createdAt なしで base 2020-01-01、7日ごとで 2020-01-08 → true",
    habit: {
      ...baseHabit,
      scheduleRule: "interval_days",
      scheduleIntervalDays: 7,
      createdAt: undefined,
    },
    date: "2020-01-08",
    expected: true,
  },
];

export function runScheduleTests(): boolean {
  let ok = 0;
  for (const c of SCHEDULE_TEST_CASES) {
    const got = isDateInSchedule(c.date, c.habit);
    const pass = got === c.expected;
    if (pass) ok++;
    else
      console.error(
        `FAIL isDateInSchedule: ${c.description} → expected ${c.expected}, got ${got}`
      );
  }
  console.log(`Schedule isDateInSchedule: ${ok}/${SCHEDULE_TEST_CASES.length} passed`);

  // getTodayTodos: 複数習慣で開始時刻順
  const habitsForTodos: HabitWithSchedule[] = [
    {
      ...baseHabit,
      id: "h1",
      name: "Later",
      scheduleRule: "daily",
      scheduleStart: "12:00",
      scheduleEnd: "13:00",
    },
    {
      ...baseHabit,
      id: "h2",
      name: "First",
      scheduleRule: "daily",
      scheduleStart: "09:00",
      scheduleEnd: "10:00",
    },
  ];
  const todos = getTodayTodos("2025-02-01", habitsForTodos);
  const orderOk = todos.length === 2 && todos[0].habitId === "h2" && todos[1].habitId === "h1";
  if (orderOk) ok++;
  else console.error("FAIL getTodayTodos: expected order First then Later");
  console.log(`Schedule getTodayTodos order: ${orderOk ? "ok" : "fail"}`);

  return ok === SCHEDULE_TEST_CASES.length + 1;
}
