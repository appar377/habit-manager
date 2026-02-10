"use client";

import { useState, useTransition } from "react";
import { updateRivalAction, removeRivalAction } from "@/lib/actions";
import type { Rival } from "@/lib/store";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Label from "./ui/Label";

type Props = {
  rivals: Rival[];
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

export default function RivalList({ rivals }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (rivals.length === 0) return null;

  return (
    <ul className="space-y-3">
      {rivals.map((r) => (
        <li
          key={r.id}
          className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-3 shadow-[var(--shadow-card)]"
        >
          {editingId === r.id ? (
            <RivalEditForm
              rival={r}
              onCancel={() => setEditingId(null)}
              onSave={() => setEditingId(null)}
              isPending={isPending}
              startTransition={startTransition}
            />
          ) : (
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-12 w-12 rounded-[var(--radius-pill)] bg-primary-soft/70 border border-border flex items-center justify-center font-bold text-primary">
                  {initials(r.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{r.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.logStreak != null && (
                      <span className="text-[11px] px-2 py-0.5 rounded-[999px] bg-bg-subtle text-fg-muted">
                        記録 {r.logStreak}日
                      </span>
                    )}
                    {r.planStreak != null && (
                      <span className="text-[11px] px-2 py-0.5 rounded-[999px] bg-bg-subtle text-fg-muted">
                        達成 {r.planStreak}日
                      </span>
                    )}
                    {r.comebackCount != null && (
                      <span className="text-[11px] px-2 py-0.5 rounded-[999px] bg-bg-subtle text-fg-muted">
                        立ち上がり {r.comebackCount}回
                      </span>
                    )}
                    {r.achievementRate != null && (
                      <span className="text-[11px] px-2 py-0.5 rounded-[999px] bg-primary-soft/60 text-primary">
                        達成率 {Math.round(r.achievementRate * 100)}%
                      </span>
                    )}
                    {r.logStreak == null &&
                      r.planStreak == null &&
                      r.comebackCount == null &&
                      r.achievementRate == null && (
                        <span className="text-[11px] px-2 py-0.5 rounded-[999px] bg-bg-subtle text-fg-subtle">
                          数値未入力
                        </span>
                      )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" className="min-h-[36px] px-2 text-xs" onClick={() => setEditingId(r.id)}>
                  編集
                </Button>
                <Button
                  variant="ghost"
                  className="min-h-[36px] px-2 text-xs text-fg-muted hover:text-danger"
                  onClick={() => {
                    startTransition(() => {
                      void (async () => {
                        await removeRivalAction(r.id);
                      })();
                    });
                  }}
                  disabled={isPending}
                >
                  削除
                </Button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function RivalEditForm({
  rival,
  onCancel,
  onSave,
  isPending,
  startTransition,
}: {
  rival: Rival;
  onCancel: () => void;
  onSave: () => void;
  isPending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [name, setName] = useState(rival.name);
  const [logStreak, setLogStreak] = useState(rival.logStreak?.toString() ?? "");
  const [planStreak, setPlanStreak] = useState(rival.planStreak?.toString() ?? "");
  const [comebackCount, setComebackCount] = useState(rival.comebackCount?.toString() ?? "");
  const [achievementRate, setAchievementRate] = useState(
    rival.achievementRate != null ? String(Math.round(rival.achievementRate * 100)) : ""
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      void (async () => {
        await updateRivalAction(rival.id, {
          name: name.trim(),
          logStreak: logStreak !== "" ? Number(logStreak) : undefined,
          planStreak: planStreak !== "" ? Number(planStreak) : undefined,
          comebackCount: comebackCount !== "" ? Number(comebackCount) : undefined,
          achievementRate:
            achievementRate !== "" ? Math.min(1, Math.max(0, Number(achievementRate) / 100)) : undefined,
        });
        onSave();
      })();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <Label>名前</Label>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>記録ストリーク</Label>
          <Input type="number" min={0} value={logStreak} onChange={(e) => setLogStreak(e.target.value)} />
        </div>
        <div>
          <Label>達成ストリーク</Label>
          <Input type="number" min={0} value={planStreak} onChange={(e) => setPlanStreak(e.target.value)} />
        </div>
        <div>
          <Label>立ち上がり回数</Label>
          <Input type="number" min={0} value={comebackCount} onChange={(e) => setComebackCount(e.target.value)} />
        </div>
        <div>
          <Label>達成率（%）</Label>
          <Input type="number" min={0} max={100} value={achievementRate} onChange={(e) => setAchievementRate(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中…" : "保存"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
