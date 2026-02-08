"use client";

import { useState } from "react";
import type { Habit } from "@/lib/store";
import LogForm from "./LogForm";

type Props = {
  habits: Habit[];
  defaultHabitId: string;
  /** 予定ページで表示中の日付。記録追加時の初期日付になる。 */
  defaultDate?: string;
};

/** 予定ページ下部の「記録を追加」折りたたみ。詳細ログや予定にない習慣を追加用。 */
export default function AddLogSection({ habits, defaultHabitId, defaultDate }: Props) {
  const [open, setOpen] = useState(false);

  if (habits.length === 0) return null;

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-fg-subtle hover:text-fg-muted underline underline-offset-2"
      >
        {open ? "閉じる" : "rep・時間を後から追加"}
      </button>
      {open && (
        <div className="mt-3 rounded-[var(--radius-xl)] border border-border bg-bg-subtle p-4">
          <p className="text-xs text-fg-muted mb-3">
            予定にない習慣や、セット数・時間を細かく残したいときはここから。
          </p>
          <LogForm habits={habits} defaultHabitId={defaultHabitId} initialDate={defaultDate} />
        </div>
      )}
    </section>
  );
}
