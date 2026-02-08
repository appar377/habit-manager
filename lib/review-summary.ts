/**
 * Review ページ用の自動文章サマリ（観測・断定しない）。
 * 純関数・テストしやすい形。LLM は使わずローカル計算のみ。
 */

export type Trend = "up" | "down" | "same";

export type ReviewSummaryInput = {
  volumeTrend: Trend;
  durationTrend: Trend;
  /** 習慣別サマリ（上位1〜2件）。任意。 */
  habitLines?: { name: string; trend: Trend }[];
};

const PHRASES: Record<Trend, { volume: string; duration: string; habit: string }> = {
  up: {
    volume: "直近7日は volume が前週より増加傾向。",
    duration: "duration は前週より増加傾向。",
    habit: "は前週より増加傾向。",
  },
  down: {
    volume: "直近7日は volume が前週より減少傾向。",
    duration: "duration は前週より減少傾向。",
    habit: "は前週より減少傾向。",
  },
  same: {
    volume: "volume は前週と同程度。",
    duration: "duration は前週と同程度。",
    habit: "は前週と同程度。",
  },
};

/**
 * 直近7日 vs 前週の観測サマリを1〜2行（＋習慣別0〜2行）で返す。
 * 評価はせず「傾向」「同程度」などの表現に留める。
 */
export function buildReviewSummary(input: ReviewSummaryInput): string[] {
  const lines: string[] = [];
  const { volumeTrend, durationTrend, habitLines = [] } = input;

  lines.push(PHRASES[volumeTrend].volume);
  lines.push(PHRASES[durationTrend].duration);

  const topHabits = habitLines.slice(0, 2);
  for (const { name, trend } of topHabits) {
    lines.push(`${name} ${PHRASES[trend].habit}`);
  }

  return lines;
}
