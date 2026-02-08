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
      className={`rounded-[var(--radius-xl)] border-2 p-4 flex flex-col gap-3 min-h-[72px] bg-bg-muted shadow-[var(--shadow-card)] ${
        hasAccent
          ? "border-l-4 border-l-primary border-border"
          : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-fg-muted mb-0.5">{label}</p>
          <p className="text-xl font-semibold tabular-nums">
            {value}
            {unit && <span className="text-sm font-normal text-fg-muted ml-1">{unit}</span>}
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
