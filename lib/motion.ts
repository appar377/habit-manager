/**
 * マイクロアニメーション用の共通設定。
 * 原則: クリック→反応 100ms 以内、毎回同じ挙動、過剰な演出禁止。
 */

/** 押下時のスケール（軽い縮みで触感を出す） */
export const TAP_SCALE = 0.97;

/** スプリング: 速く戻る・予測可能（~100–150ms 体感） */
export const TAP_SPRING = {
  type: "spring" as const,
  stiffness: 500,
  damping: 35,
  mass: 0.5,
};

/** 一般的なトランジション（フェード等）用の短い duration */
export const QUICK_DURATION = 0.15;
