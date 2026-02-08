"use client";

import { useState, useTransition } from "react";
import { setCheatDayConfigAction } from "@/lib/actions";
import type { CheatDayConfig, CheatDayEffect } from "@/lib/store";
import Label from "./ui/Label";

type Props = {
  presets: CheatDayConfig[];
};

const EFFECT_OPTIONS: { value: CheatDayEffect; label: string; desc: string }[] = [
  { value: "both", label: "両方のストリークを維持", desc: "記録も達成もその日は達成扱い" },
  { value: "log_only", label: "記録ストリークのみ", desc: "ログがなくても記録ストリークは途切れない" },
  { value: "plan_only", label: "達成ストリークのみ", desc: "予定をやらなくても達成ストリークは途切れない" },
  { value: "record_only", label: "記録だけ", desc: "ストリークには影響しない（取得した事実だけ残す）" },
];

/** 初回用：チートデイの周期と「アプリでの反映方法」を選ばせる。 */
export default function CheatDayOnboarding({ presets }: Props) {
  const [isPending, startTransition] = useTransition();
  const [effect, setEffect] = useState<CheatDayEffect>("both");

  function select(config: CheatDayConfig) {
    startTransition(async () => {
      await setCheatDayConfigAction({ ...config, effect });
    });
  }

  return (
    <section
      className="rounded-[var(--radius-xl)] border border-border bg-bg-muted p-4 shadow-[var(--shadow-card)]"
      aria-labelledby="cheat-day-onboarding-title"
    >
      <h2 id="cheat-day-onboarding-title" className="text-sm font-semibold text-foreground mb-1">
        チートデイを設定
      </h2>
      <p className="text-xs text-fg-muted mb-4">
        周期を選び、チートデイを使った日にアプリでどう扱うかを選んでください。報酬の内容（何をするか）はあなた次第で、使った日にメモできます。
      </p>

      <div className="mb-4">
        <Label>チートデイを使った日、アプリでどう扱うか</Label>
        <ul className="mt-1 space-y-1.5">
          {EFFECT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cheat-effect"
                  value={opt.value}
                  checked={effect === opt.value}
                  onChange={() => setEffect(opt.value)}
                  className="mt-1"
                />
                <span className="text-sm">
                  <span className="font-medium text-foreground">{opt.label}</span>
                  <span className="text-fg-muted ml-1">— {opt.desc}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <Label>解禁の周期・条件</Label>
      <ul className="mt-1 space-y-2">
        {presets.map((preset) => (
          <li key={`${preset.cycleDays}-${preset.requiredAchievementPercent}`}>
            <button
              type="button"
              onClick={() => select(preset)}
              disabled={isPending}
              className="w-full text-left rounded-[var(--radius-lg)] border border-border bg-bg-subtle p-3 hover:border-primary hover:bg-primary-soft transition-colors disabled:opacity-50"
            >
              <span className="block font-medium text-foreground">{preset.label}</span>
              <span className="block text-xs text-fg-muted mt-0.5">{preset.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
