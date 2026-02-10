"use client";

import { motion } from "framer-motion";

function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export default function SimpleLineChart({
  data,
  height = 160,
  showAverage = true,
  xLabel = "日付",
  yLabel = "値",
  yUnit,
}: {
  data: { date: string; value: number }[];
  height?: number;
  showAverage?: boolean;
  xLabel?: string;
  yLabel?: string;
  yUnit?: string;
}) {
  const width = 400;
  const padLeft = 48;
  const padRight = 18;
  const padTop = 16;
  const padBottom = 28;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;

  const x = (i: number) => padLeft + (i * chartWidth) / Math.max(1, data.length - 1);
  const y = (v: number) => padTop + ((max - v) * chartHeight) / span;

  const avg =
    showAverage && data.length > 0
      ? values.reduce((a, v) => a + v, 0) / data.length
      : null;
  const avgY = avg != null ? y(avg) : null;

  const linePoints = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const areaPath =
    data.length > 0
      ? `M ${x(0)},${padTop + chartHeight} L ${linePoints} L ${x(data.length - 1)},${padTop + chartHeight} Z`
      : "";
  const linePath = data.length > 0 ? `M ${data.map((d, i) => `${x(i)} ${y(d.value)}`).join(" L ")}` : "";
  const mid = (max + min) / 2;

  function formatValue(v: number): string {
    const rounded = Math.round(v * 10) / 10;
    return yUnit ? `${rounded}${yUnit}` : String(rounded);
  }

  return (
    <motion.div
      className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted/80 p-4 shadow-[var(--shadow-card)] overflow-hidden"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full block"
        style={{ height: height - 24 }}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <line
          x1={padLeft}
          y1={padTop}
          x2={padLeft}
          y2={padTop + chartHeight}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <line
          x1={padLeft}
          y1={padTop + chartHeight}
          x2={width - padRight}
          y2={padTop + chartHeight}
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        {[max, mid, min].map((v, i) => (
          <g key={`tick-${i}`}>
            <line
              x1={padLeft}
              y1={y(v)}
              x2={width - padRight}
              y2={y(v)}
              stroke="var(--color-border)"
              strokeWidth="1"
              opacity={i === 1 ? 0.35 : 0.2}
            />
            <text
              x={padLeft - 6}
              y={y(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="var(--color-fg-muted)"
              fontSize="10"
            >
              {formatValue(v)}
            </text>
          </g>
        ))}
        {areaPath && (
          <motion.path
            d={areaPath}
            fill="url(#chart-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
        )}
        {avgY != null && (
          <line
            x1={padLeft}
            y1={avgY}
            x2={width - padRight}
            y2={avgY}
            stroke="var(--color-primary)"
            strokeWidth="1"
            strokeDasharray="6 4"
            opacity={0.4}
          />
        )}
        {linePath && (
          <motion.path
            d={linePath}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        {data.map((d, i) => (
          <motion.circle
            key={d.date}
            cx={x(i)}
            cy={y(d.value)}
            r="4"
            fill="var(--color-primary)"
            className="drop-shadow-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + i * 0.03, type: "spring", stiffness: 400, damping: 24 }}
          />
        ))}
      </svg>
      <div className="flex justify-between text-[11px] text-fg-muted mt-2 tabular-nums">
        <span>{data[0] ? formatDateShort(data[0].date) : ""}</span>
        <span>{data[data.length - 1] ? formatDateShort(data[data.length - 1].date) : ""}</span>
      </div>
      <div className="flex items-center justify-between text-[11px] text-fg-subtle mt-1">
        <span>Y軸: {yLabel}{yUnit ? `（${yUnit}）` : ""}</span>
        <span>X軸: {xLabel}</span>
      </div>
    </motion.div>
  );
}
