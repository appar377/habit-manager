"use client";

import { useEffect, useState } from "react";

const MESSAGES: Record<"up" | "down" | "same", string> = {
  up: "前回より上",
  down: "今日は調整日",
  same: "安定",
};

const DISPLAY_MS = 800;

type Props = {
  feedback: "up" | "down" | "same" | null;
  onDone?: () => void;
};

export default function FeedbackToast({ feedback, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) {
      setVisible(false);
      setMessage(null);
      return;
    }
    setMessage(MESSAGES[feedback]);
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, DISPLAY_MS);
    return () => clearTimeout(t);
  }, [feedback, onDone]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-[calc(56px+env(safe-area-inset-bottom)+0.5rem)] left-4 right-4 max-w-lg mx-auto z-30 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <p className="py-3 px-4 rounded-[var(--radius-xl)] bg-primary text-primary-contrast text-center text-sm font-semibold shadow-[var(--shadow-card-hover)]">
        {message}
      </p>
    </div>
  );
}
