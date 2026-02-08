/**
 * マイクロアニメーション用の共通設定。
 * ゲーム感を出しつつ、クリック→反応は速く、過剰にならないように。
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

/** バウンス気味のスプリング（カード登場・数字ポップ用） */
export const BOUNCE_SPRING = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
  mass: 0.6,
};

/** 一般的なトランジション（フェード等）用の短い duration */
export const QUICK_DURATION = 0.15;

/** カード登場: 下から少し浮かび上がり + フェード */
export const CARD_ENTER = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 400, damping: 30 },
};

/** リスト用: 親の stagger */
export const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

/** リスト用: 子アイテム */
export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 400, damping: 30 },
};
