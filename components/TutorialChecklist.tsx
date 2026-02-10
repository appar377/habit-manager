"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import Button from "./ui/Button";
import CheckCircle from "./ui/CheckCircle";
import {
  readTutorialState,
  subscribeTutorial,
  writeTutorialState,
} from "@/lib/tutorial";

const ITEMS = [
  { id: "plan", label: "今日の予定を確認する", href: "/plan" },
  { id: "add", label: "習慣を追加する", href: "/habits" },
  { id: "log", label: "完了チェックで記録する", href: "/plan" },
  { id: "review", label: "分析を見る", href: "/review" },
  { id: "ranking", label: "コミュニティを見る", href: "/ranking" },
] as const;

export default function TutorialChecklist() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const state = useSyncExternalStore(
    subscribeTutorial,
    readTutorialState,
    () =>
      ({
        seen: false,
        hidden: false,
        checks: {} as Record<string, boolean>,
      } as ReturnType<typeof readTutorialState>)
  );

  if (!isClient) return null;

  const total = ITEMS.length;
  const completed = ITEMS.filter((i) => state.checks?.[i.id]).length;
  const progress = Math.round((completed / total) * 100);

  function toggleItem(id: string) {
    const next = {
      ...state,
      checks: { ...state.checks, [id]: !state.checks[id] },
    };
    writeTutorialState(next);
  }

  function complete() {
    writeTutorialState({ ...state, seen: true, hidden: true });
  }

  return (
    <div className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-fg-muted">はじめてのチュートリアル</p>
          <p className="text-sm font-semibold text-foreground">チェックリスト</p>
        </div>
        <Button variant="ghost" className="min-h-[32px] px-2 text-xs" onClick={complete}>
          完了
        </Button>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-fg-muted mb-1">
          <span>進捗</span>
          <span>{completed}/{total}</span>
        </div>
        <div className="h-2 rounded-[999px] bg-border/40 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {ITEMS.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <CheckCircle
              checked={!!state.checks[item.id]}
              onToggle={() => toggleItem(item.id)}
              aria-label={`${item.label} を${state.checks[item.id] ? "未完了" : "完了"}にする`}
              aria-pressed={!!state.checks[item.id]}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground truncate">{item.label}</p>
              <Link href={item.href} className="text-[11px] text-primary">
                開く
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
