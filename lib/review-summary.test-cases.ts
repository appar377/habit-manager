/**
 * buildReviewSummary のテストケース（純関数・観測表現の確認用）。
 * 実行: テストランナーで buildReviewSummary に FEEDBACK_SUMMARY_TEST_CASES を渡す。
 */
import { buildReviewSummary, type ReviewSummaryInput } from "./review-summary";

export const REVIEW_SUMMARY_TEST_CASES: {
  description: string;
  input: ReviewSummaryInput;
  expectedFirstLine: string;
}[] = [
  {
    description: "volume 増加・duration 同程度",
    input: { volumeTrend: "up", durationTrend: "same" },
    expectedFirstLine: "直近7日は volume が前週より増加傾向。",
  },
  {
    description: "volume 同程度・duration 減少",
    input: { volumeTrend: "same", durationTrend: "down" },
    expectedFirstLine: "volume は前週と同程度。",
  },
  {
    description: "両方同程度",
    input: { volumeTrend: "same", durationTrend: "same" },
    expectedFirstLine: "volume は前週と同程度。",
  },
  {
    description: "習慣別1件",
    input: {
      volumeTrend: "up",
      durationTrend: "same",
      habitLines: [{ name: "Burpees", trend: "up" }],
    },
    expectedFirstLine: "直近7日は volume が前週より増加傾向。",
  },
];

export function runReviewSummaryTests(): boolean {
  let ok = 0;
  for (const c of REVIEW_SUMMARY_TEST_CASES) {
    const got = buildReviewSummary(c.input);
    const pass = got.length >= 1 && got[0] === c.expectedFirstLine;
    if (pass) ok++;
    else console.error(`FAIL: ${c.description} → first line expected "${c.expectedFirstLine}", got "${got[0]}"`);
  }
  console.log(`Review summary tests: ${ok}/${REVIEW_SUMMARY_TEST_CASES.length} passed`);
  return ok === REVIEW_SUMMARY_TEST_CASES.length;
}
