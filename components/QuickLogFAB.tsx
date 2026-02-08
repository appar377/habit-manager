"use client";

import { useState } from "react";
import type { Habit } from "@/lib/store";
import QuickLogSheet from "./QuickLogSheet";

type Props = {
  habits: Habit[];
  defaultHabitId: string;
  defaultDate?: string;
};

/** 画面の右下に浮かぶ「記録」ボタン。タップで rep・時間をさっと記録するシートを開く。 */
export default function QuickLogFAB({ habits, defaultHabitId, defaultDate }: Props) {
  const [open, setOpen] = useState(false);

  if (habits.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 z-30 md:right-6 md:bottom-6 w-14 h-14 rounded-full bg-primary text-primary-contrast shadow-[var(--shadow-button)] flex items-center justify-center hover:bg-primary-hover active:scale-95 transition-transform"
        aria-label="rep・時間を記録"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <QuickLogSheet
        open={open}
        onClose={() => setOpen(false)}
        habits={habits}
        defaultHabitId={defaultHabitId}
        defaultDate={defaultDate}
      />
    </>
  );
}
