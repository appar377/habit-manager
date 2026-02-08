"use client";

import { useTransition } from "react";
import { setCheatDayConfigAction } from "@/lib/actions";
import type { CheatDayConfig } from "@/lib/store";
import Button from "./ui/Button";

type Props = {
  presets: CheatDayConfig[];
};

/** 初回用：チートデイの周期プリセットを選ばせる。 */
export default function CheatDayOnboarding({ presets }: Props) {
  const [isPending, startTransition] = useTransition();

  function select(config: CheatDayConfig) {
    startTransition(async () => {
      await setCheatDayConfigAction(config);
    });
  }

  return (
    <section
      className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)]"
      aria-labelledby="cheat-day-onboarding-title"
    >
      <h2 id="cheat-day-onboarding-title" className="text-sm font-semibold text-foreground mb-1">
        チートデイを設定
      </h2>
      <p className="text-xs text-fg-muted mb-4">
        研究では「計画的な休みの日」を設けると習慣の継続率が上がることが報告されています。周期と条件を選んでください。
      </p>
      <ul className="space-y-2">
        {presets.map((preset) => (
          <li key={`${preset.cycleDays}-${preset.requiredAchievementPercent}`}>
            <button
              type="button"
              onClick={() => select(preset)}
              disabled={isPending}
              className="w-full text-left rounded-[var(--radius-lg)] border-2 border-border bg-bg-subtle p-3 hover:border-primary hover:bg-primary-soft transition-colors disabled:opacity-50"
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
