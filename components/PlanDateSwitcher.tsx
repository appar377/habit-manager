"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, addMonths, formatDateJa } from "@/lib/utils";
import type { PlanView } from "./PlanPageHeader";

type Props = {
  date: string;
  today: string;
  view?: PlanView;
};

function planHref(date: string, view?: PlanView): string {
  const base = `/plan?date=${date}`;
  return view && view !== "day" ? `${base}&view=${view}` : base;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function monthDates(year: number, month: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0));
  const startPad = first.getUTCDay();
  const daysInMonth = last.getUTCDate();
  const result: (string | null)[] = [];
  for (let i = 0; i < startPad; i++) result.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    result.push(`${year}-${mm}-${dd}`);
  }
  return result;
}

export default function PlanDateSwitcher({ date, today, view = "day" }: Props) {
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  const [y, m] = date.split("-").map(Number);
  const prevLink =
    view === "week"
      ? addDays(date, -7)
      : view === "month"
        ? addMonths(date, -1)
        : addDays(date, -1);
  const nextLink =
    view === "week"
      ? addDays(date, 7)
      : view === "month"
        ? addMonths(date, 1)
        : addDays(date, 1);
  const isToday = date === today;
  const href = (d: string) => planHref(d, view);
  const navLabel =
    view === "week" ? { prev: "前の週", next: "次の週" } : view === "month" ? { prev: "前の月", next: "次の月" } : { prev: "前の日", next: "次の日" };

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const cells = monthDates(y, m);
  const currentYear = new Date().getFullYear();
  const monthLabel = y !== currentYear ? `${y}年${m}月` : `${m}月`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link
        href={href(prevLink)}
        className="rounded-[var(--radius-lg)] p-2.5 text-fg-muted hover:text-foreground hover:bg-primary-soft/60 transition-all duration-[var(--duration-fast)] hover:scale-105 active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
        aria-label={navLabel.prev}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>

      <div className="relative" ref={popRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-[var(--radius-lg)] px-3 py-2 text-sm font-semibold text-foreground hover:bg-primary-soft/50 min-w-[8rem] text-left flex items-center justify-between gap-2 border-2 border-transparent hover:border-border transition-all duration-[var(--duration-fast)]"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="日付を選ぶ"
        >
          <time dateTime={date}>{formatDateJa(date)}</time>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-label="カレンダー"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-full z-20 mt-2 rounded-[var(--radius-xl)] border-2 border-border bg-[color:var(--color-primary-soft)]/95 shadow-[var(--shadow-card)] p-3 min-w-[240px] backdrop-blur-sm"
            >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
              <span className="flex gap-1">
                <Link
                  href={href(m === 1 ? `${y - 1}-12-01` : `${y}-${String(m - 1).padStart(2, "0")}-01`)}
                  className="rounded p-1 text-fg-muted hover:bg-white/50"
                  onClick={() => setOpen(false)}
                >
                  ‹
                </Link>
                <Link
                  href={href(m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`)}
                  className="rounded p-1 text-fg-muted hover:bg-white/50"
                  onClick={() => setOpen(false)}
                >
                  ›
                </Link>
              </span>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {DAY_LABELS.map((label) => (
                <span key={label} className="text-xs text-fg-muted py-0.5">
                  {label}
                </span>
              ))}
              {cells.map((d, i) =>
                d ? (
                  <Link
                    key={d}
                    href={href(d)}
                    onClick={() => setOpen(false)}
                    className={`inline-flex items-center justify-center w-8 h-8 mx-auto rounded-full text-sm font-medium transition-all duration-150 ${
                      d === date
                        ? "bg-primary text-primary-contrast shadow-[var(--shadow-button)] scale-110"
                        : d === today
                          ? "ring-2 ring-primary text-primary bg-white/60 hover:scale-105"
                          : "text-foreground hover:bg-white/70 hover:scale-105"
                    }`}
                  >
                    {new Date(d + "T12:00:00Z").getUTCDate()}
                  </Link>
                ) : (
                  <span key={`empty-${i}`} />
                )
              )}
            </div>
            {!isToday && (
              <Link
                href="/plan"
                onClick={() => setOpen(false)}
                className="mt-3 block text-center text-sm font-semibold text-primary hover:underline py-1 rounded-[var(--radius-md)] hover:bg-white/30 transition-colors"
              >
                今日へ
              </Link>
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link
        href={href(nextLink)}
        className="rounded-[var(--radius-lg)] p-2.5 text-fg-muted hover:text-foreground hover:bg-primary-soft/60 transition-all duration-[var(--duration-fast)] hover:scale-105 active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
        aria-label={navLabel.next}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>

      {isToday ? (
        <span className="text-xs font-bold text-primary px-3 py-1.5 rounded-[var(--radius-pill)] bg-primary-soft border border-primary/30">
          今日
        </span>
      ) : (
        <Link
          href="/plan"
          className="text-xs font-semibold text-fg-muted hover:text-primary px-3 py-1.5 rounded-[var(--radius-pill)] hover:bg-primary-soft/50 transition-colors"
        >
          今日
        </Link>
      )}
    </div>
  );
}
