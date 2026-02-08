/**
 * 前回比を「長さ」だけで感じさせる。2本のバーで前週 vs 今週を比較。
 * 数値は出さない（オプションで表示可）。良し悪しは評価しない。
 */
type Props = {
  lastValue: number;
  thisValue: number;
  labelLeft?: string;
  labelRight?: string;
  showValues?: boolean;
  unit?: string;
};

export default function ComparisonBar({
  lastValue,
  thisValue,
  labelLeft = "前週",
  labelRight = "今週",
  showValues = false,
  unit = "",
}: Props) {
  const max = Math.max(lastValue, thisValue, 1);
  const lastWidth = (lastValue / max) * 100;
  const thisWidth = (thisValue / max) * 100;

  const bar = (width: number, isThis: boolean) => (
    <div className="flex-1 h-2 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
      <div
        className="h-full rounded-full transition-[width]"
        style={{
          width: `${width}%`,
          backgroundColor: isThis ? "var(--foreground)" : "var(--neutral-500, #737373)",
        }}
      />
    </div>
  );

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-400 w-7 shrink-0">{labelLeft}</span>
        {bar(lastWidth, false)}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-400 w-7 shrink-0">{labelRight}</span>
        {bar(thisWidth, true)}
      </div>
      {showValues && (
        <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
          <span>{lastValue}{unit}</span>
          <span>{thisValue}{unit}</span>
        </div>
      )}
    </div>
  );
}
