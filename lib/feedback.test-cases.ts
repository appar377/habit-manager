/**
 * 記録直後フィードバック判定のテストケース。
 * 実行: npx tsx lib/feedback.test-cases.ts （または Node で require して runTests()）
 */
import { getFeedbackResult } from "./feedback";
import type { Habit, Log } from "./store";

const exerciseHabit: Habit = {
  id: "h1",
  name: "Burpees",
  type: "exercise",
  targetSets: 10,
  targetReps: 25,
};

const studyHabit: Habit = {
  id: "h2",
  name: "Study",
  type: "study",
  targetMin: 90,
};

type Case = {
  description: string;
  newLog: Log;
  prevLog: Log | null;
  habit: Habit;
  expected: "up" | "down" | "same";
};

export const FEEDBACK_TEST_CASES: Case[] = [
  {
    description: "初回（前回なし）→ same",
    newLog: { id: "l1", date: "2025-02-01", habitId: "h1", volume: 250, durationMin: 0 },
    prevLog: null,
    habit: exerciseHabit,
    expected: "same",
  },
  {
    description: "前回なし（同習慣で今回が1件目）→ same",
    newLog: { id: "l1", date: "2025-02-01", habitId: "h1", volume: 100, durationMin: 0 },
    prevLog: null,
    habit: exerciseHabit,
    expected: "same",
  },
  {
    description: "同値（volume）→ same",
    newLog: { id: "l2", date: "2025-02-01", habitId: "h1", volume: 275, durationMin: 0 },
    prevLog: { id: "l1", date: "2025-01-31", habitId: "h1", volume: 275, durationMin: 0 },
    habit: exerciseHabit,
    expected: "same",
  },
  {
    description: "同値（durationMin）→ same",
    newLog: { id: "l2", date: "2025-02-01", habitId: "h2", volume: 0, durationMin: 90 },
    prevLog: { id: "l1", date: "2025-01-31", habitId: "h2", volume: 0, durationMin: 90 },
    habit: studyHabit,
    expected: "same",
  },
  {
    description: "増加（volume）→ up",
    newLog: { id: "l2", date: "2025-02-01", habitId: "h1", volume: 300, durationMin: 0 },
    prevLog: { id: "l1", date: "2025-01-31", habitId: "h1", volume: 275, durationMin: 0 },
    habit: exerciseHabit,
    expected: "up",
  },
  {
    description: "増加（durationMin）→ up",
    newLog: { id: "l2", date: "2025-02-01", habitId: "h2", volume: 0, durationMin: 120 },
    prevLog: { id: "l1", date: "2025-01-31", habitId: "h2", volume: 0, durationMin: 90 },
    habit: studyHabit,
    expected: "up",
  },
  {
    description: "減少（volume）→ down",
    newLog: { id: "l2", date: "2025-02-01", habitId: "h1", volume: 200, durationMin: 0 },
    prevLog: { id: "l1", date: "2025-01-31", habitId: "h1", volume: 275, durationMin: 0 },
    habit: exerciseHabit,
    expected: "down",
  },
  {
    description: "減少（durationMin）→ down",
    newLog: { id: "l2", date: "2025-02-01", habitId: "h2", volume: 0, durationMin: 60 },
    prevLog: { id: "l1", date: "2025-01-31", habitId: "h2", volume: 0, durationMin: 90 },
    habit: studyHabit,
    expected: "down",
  },
];

export function runFeedbackTests(): boolean {
  let ok = 0;
  for (const c of FEEDBACK_TEST_CASES) {
    const got = getFeedbackResult(c.newLog, c.prevLog, c.habit);
    const pass = got === c.expected;
    if (pass) ok++;
    else console.error(`FAIL: ${c.description} → expected ${c.expected}, got ${got}`);
  }
  console.log(`Feedback tests: ${ok}/${FEEDBACK_TEST_CASES.length} passed`);
  return ok === FEEDBACK_TEST_CASES.length;
}

// 実行: npx tsx lib/feedback.test-cases.ts で runFeedbackTests() を呼ぶ
