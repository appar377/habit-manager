"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Habit } from "@/lib/store";
import { updatePlanOverrideAction } from "@/lib/actions";
import { roundTimeTo15, timeToMinutes, getTimeOptions15, getEndTimeOptions15 } from "@/lib/time";
import LogForm from "./LogForm";
import Label from "./ui/Label";
import Button from "./ui/Button";
import Select from "./ui/Select";

type Props = {
  open: boolean;
  onClose: () => void;
  habits: Habit[];
  habitId: string;
  date: string;
  initialStart: string;
  initialEnd: string;
  initialMemo?: string;
};

export default function PlanEventDetailSheet({
  open,
  onClose,
  habits,
  habitId,
  date,
  initialStart,
  initialEnd,
  initialMemo = "",
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [start, setStart] = useState(() => roundTimeTo15(initialStart));
  const [end, setEnd] = useState(() => roundTimeTo15(initialEnd));
  const [memo, setMemo] = useState(initialMemo);

  useEffect(() => {
    if (!open) return;
    const s = roundTimeTo15(initialStart);
    const e = roundTimeTo15(initialEnd);
    setStart(s);
    setEnd(timeToMinutes(e) > timeToMinutes(s) ? e : getEndTimeOptions15(s)[0] ?? s);
    setMemo(initialMemo ?? "");
  }, [open, initialStart, initialEnd, initialMemo]);

  const startOptions = getTimeOptions15();
  const endOptions = getEndTimeOptions15(start);

  const handleStartChange = (newStart: string) => {
    setStart(newStart);
    const nextEndOptions = getEndTimeOptions15(newStart);
    const endMin = timeToMinutes(end);
    const minEndMin = timeToMinutes(newStart) + 15;
    if (endMin < minEndMin || !nextEndOptions.includes(end)) {
      setEnd(nextEndOptions[0] ?? end);
    }
  };

  const handleEndChange = (newEnd: string) => {
    setEnd(newEnd);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const habit = habits.find((h) => h.id === habitId);
  const title = habit?.name ?? "予定の詳細";

  const hasChanges =
    roundTimeTo15(start) !== roundTimeTo15(initialStart) ||
    roundTimeTo15(end) !== roundTimeTo15(initialEnd) ||
    (memo.trim() || "") !== (initialMemo?.trim() ?? "");

  const isValidTimeRange = timeToMinutes(end) > timeToMinutes(start);

  const saveOverride = () => {
    if (!hasChanges || !isValidTimeRange) return;
    const s = roundTimeTo15(start);
    const e = roundTimeTo15(end);
    startTransition(async () => {
      await updatePlanOverrideAction(date, habitId, { start: s, end: e, memo: memo.trim() || undefined });
      router.refresh();
    });
  };

  const handleBlur = () => {
    if (hasChanges) saveOverride();
  };

  if (habits.length === 0) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            aria-hidden
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-event-detail-title"
            className="fixed left-0 right-0 bottom-0 z-50 rounded-t-[var(--radius-xl)] border-t-2 border-border bg-bg-muted shadow-[0_-4px 24px rgba(0,0,0,0.12)] max-h-[85dvh] flex flex-col"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
              <h2 id="plan-event-detail-title" className="text-base font-bold text-foreground">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--radius-md)] p-2 text-fg-muted hover:text-foreground hover:bg-bg-subtle"
                aria-label="閉じる"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 px-4 py-4 space-y-5">
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3">時間（15分刻み）</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="plan-detail-start">開始</Label>
                    <Select
                      id="plan-detail-start"
                      value={start}
                      onChange={(e) => handleStartChange(e.target.value)}
                      onBlur={handleBlur}
                      aria-label="開始時刻"
                    >
                      {startOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="plan-detail-end">終了</Label>
                    <Select
                      id="plan-detail-end"
                      value={endOptions.includes(end) ? end : endOptions[0]}
                      onChange={(e) => handleEndChange(e.target.value)}
                      onBlur={handleBlur}
                      aria-label="終了時刻"
                    >
                      {endOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                {!isValidTimeRange && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1" role="alert">
                    終了は開始より後の時刻を選んでください
                  </p>
                )}
                {hasChanges && isValidTimeRange && (
                  <Button
                    type="button"
                    onClick={saveOverride}
                    disabled={isPending}
                    className="mt-2"
                  >
                    {isPending ? "保存中…" : "時間を保存"}
                  </Button>
                )}
              </section>

              <section>
                <Label htmlFor="plan-detail-memo">メモ</Label>
                <textarea
                  id="plan-detail-memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="メモを入力（任意）"
                  rows={3}
                  className="w-full min-h-[var(--touch-min-h)] px-[var(--input-px)] py-2 rounded-lg border border-border bg-background text-foreground text-[length:var(--text-base)] outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 resize-y"
                />
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3">rep・時間を記録</h3>
                <LogForm
                  habits={habits}
                  defaultHabitId={habitId}
                  initialDate={date}
                  onSuccess={onClose}
                />
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
