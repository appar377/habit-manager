"use client";

import { motion } from "framer-motion";

type DayItem = {
  date: string;
  scheduled: number;
  completed: number;
  rate: number;
};

type Props = {
  days: DayItem[];
  /** 日付の表示形式（例: "2/1"） */
  formatLabel?: (date: string) => string;
};

/** 日別の達成率を横並びバーで表示（直近7日など）。バーはマウント時にアニメーション。 */
export default function DailyRateBar({
  days,
  formatLabel = (d) => {
    const [y, m, day] = d.split("-");
    return `${Number(m)}/${Number(day)}`;
  },
}: Props) {
  return (
    <motion.div
      className="flex gap-1"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.04, delayChildren: 0.02 },
        },
      }}
    >
      {days.map((d) => (
        <motion.div
          key={d.date}
          className="flex-1 flex flex-col items-center gap-1"
          title={`${d.date}: ${d.completed}/${d.scheduled} 完了`}
          variants={{
            hidden: { opacity: 0, y: 4 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <div className="w-full h-16 rounded-t-md bg-bg-subtle overflow-hidden flex flex-col justify-end">
            <motion.div
              className="w-full bg-primary min-h-[2px] rounded-t-[2px]"
              initial={{ height: 0 }}
              animate={{ height: `${Math.min(100, d.rate * 100)}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            />
          </div>
          <span className="text-[10px] text-fg-muted tabular-nums">
            {formatLabel(d.date)}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
