import ComparisonBar from "./ComparisonBar";
import TrendIcon, { type Trend } from "./TrendIcon";

type Props = {
  label: string;
  value: string | number;
  trend: Trend;
  unit?: string;
  /** 前週の値。渡すとカード内に比較バー（長さのみ）を表示し、数値を見せずに前回比を感じさせる */
  lastValue?: number;
  /** 比較バーで数値も表示するか */
  showValuesInBar?: boolean;
};

export default function KPICard({
  label,
  value,
  trend,
  unit = "",
  lastValue,
  showValuesInBar = false,
}: Props) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const hasAccent = trend === "up" || trend === "down";

  return (
    <div
      className={`rounded-xl border bg-neutral-50/50 dark:bg-neutral-800/50 p-4 flex flex-col gap-3 min-h-[72px] ${
        hasAccent
          ? "border-l-4 border-l-neutral-400 dark:border-l-neutral-500 border-neutral-200 dark:border-neutral-700"
          : "border border-neutral-200 dark:border-neutral-700"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
          <p className="text-xl font-semibold tabular-nums">
            {value}
            {unit && <span className="text-sm font-normal text-neutral-500 ml-1">{unit}</span>}
          </p>
        </div>
        <TrendIcon trend={trend} className="shrink-0" />
      </div>
      {lastValue != null && (
        <ComparisonBar
          lastValue={lastValue}
          thisValue={numericValue}
          showValues={showValuesInBar}
          unit={unit}
        />
      )}
    </div>
  );
}
