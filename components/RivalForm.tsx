"use client";

import { useState, useTransition } from "react";
import { addRivalAction } from "@/lib/actions";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Label from "./ui/Label";

export default function RivalForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [logStreak, setLogStreak] = useState("");
  const [planStreak, setPlanStreak] = useState("");
  const [comebackCount, setComebackCount] = useState("");
  const [achievementRate, setAchievementRate] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await addRivalAction({
        name: trimmed,
        logStreak: logStreak !== "" ? Number(logStreak) : undefined,
        planStreak: planStreak !== "" ? Number(planStreak) : undefined,
        comebackCount: comebackCount !== "" ? Number(comebackCount) : undefined,
        achievementRate:
          achievementRate !== "" ? Math.min(1, Math.max(0, Number(achievementRate) / 100)) : undefined,
      });
      setName("");
      setLogStreak("");
      setPlanStreak("");
      setComebackCount("");
      setAchievementRate("");
    });
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-subtle p-4 space-y-3">
      <p className="text-xs text-fg-muted">
        数値は任意。空欄でも追加できます。
      </p>
      <div>
        <Label>表示名</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="フレンドの名前"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>記録ストリーク（日）</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={logStreak}
            onChange={(e) => setLogStreak(e.target.value)}
            placeholder="—"
          />
        </div>
        <div>
          <Label>達成ストリーク（日）</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={planStreak}
            onChange={(e) => setPlanStreak(e.target.value)}
            placeholder="—"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>立ち上がり回数</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={comebackCount}
            onChange={(e) => setComebackCount(e.target.value)}
            placeholder="—"
          />
        </div>
        <div>
          <Label>直近7日達成率（%）</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={achievementRate}
            onChange={(e) => setAchievementRate(e.target.value)}
            placeholder="—"
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "追加中…" : "フレンドを追加"}
      </Button>
    </form>
  );
}
