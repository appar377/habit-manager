"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Habit } from "@/lib/store";
import LogForm from "./LogForm";

type Props = {
  open: boolean;
  onClose: () => void;
  habits: Habit[];
  defaultHabitId: string;
  defaultDate?: string;
};

export default function QuickLogSheet({
  open,
  onClose,
  habits,
  defaultHabitId,
  defaultDate,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

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
            aria-labelledby="quick-log-title"
            className="fixed left-0 right-0 bottom-0 z-50 rounded-t-[var(--radius-xl)] border-t-2 border-border bg-bg-muted shadow-[0_-4px 24px rgba(0,0,0,0.12)] max-h-[85dvh] flex flex-col"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
              <h2 id="quick-log-title" className="text-base font-bold text-foreground">
                rep・時間を記録
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
            <div className="overflow-y-auto flex-1 min-h-0 px-4 py-4">
              <LogForm
                habits={habits}
                defaultHabitId={defaultHabitId}
                initialDate={defaultDate}
                onSuccess={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
