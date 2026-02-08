/** 日別など意味のある粒度の時系列のみ表示（1本の折れ線）。平均線で「平均比」を無意識に感じさせる。 */
function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export default function SimpleLineChart({
  data,
  height = 140,
  showAverage = true,
}: {
  data: { date: string; value: number }[];
  height?: number;
  /** 平均の水平線を薄く表示（平均比を位置で感じる）。評価はしない。 */
  showAverage?: boolean;
}) {
  const width = 400;
  const pad = 24;
  const max = Math.max(1, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));
  const span = max - min || 1;

  const x = (i: number) => pad + (i * (width - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => pad + ((max - v) * (height - pad * 2)) / span;

  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const avg =
    showAverage && data.length > 0
      ? data.reduce((a, d) => a + d.value, 0) / data.length
      : null;
  const avgY = avg != null ? y(avg) : null;

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50/50 dark:bg-neutral-800/50">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {avgY != null && (
          <line
            x1={pad}
            y1={avgY}
            x2={width - pad}
            y2={avgY}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity={0.35}
            aria-hidden
          />
        )}
        <polyline fill="none" stroke="currentColor" strokeWidth="2" points={pts} />
        {data.map((d, i) => (
          <circle key={d.date} cx={x(i)} cy={y(d.value)} r="3" fill="currentColor" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-neutral-500 mt-2">
        <span>{data[0] ? formatDateShort(data[0].date) : ""}</span>
        <span>{data[data.length - 1] ? formatDateShort(data[data.length - 1].date) : ""}</span>
      </div>
    </div>
  );
}
