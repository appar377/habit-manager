"use client";

import type { Rival } from "@/lib/store";

type MyStats = {
  logStreak: number;
  planStreak: number;
  comebackCount: number;
  achievementRate: number;
};

type Props = {
  myStats: MyStats;
  rivals: Rival[];
};

const METRICS: { key: keyof MyStats; label: string; format: (v: number) => string }[] = [
  { key: "logStreak", label: "記録ストリーク", format: (v) => `${v}日` },
  { key: "planStreak", label: "達成ストリーク", format: (v) => `${v}日` },
  { key: "comebackCount", label: "立ち上がり", format: (v) => `${v}回` },
  { key: "achievementRate", label: "達成率", format: (v) => `${Math.round(v * 100)}%` },
];

function getValue(stats: MyStats, key: keyof MyStats): number {
  return stats[key];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

function scoreFrom(stats: MyStats): number {
  return (
    stats.logStreak * 3 +
    stats.planStreak * 2 +
    stats.comebackCount * 1 +
    Math.round(stats.achievementRate * 100)
  );
}

export default function RankingComparison({ myStats, rivals }: Props) {
  if (rivals.length === 0) {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-bg-subtle p-6 text-center">
        <h2 className="sr-only">コミュニティ</h2>
        <p className="text-sm text-fg-muted">フレンドを追加するとリーダーボードが表示されます</p>
      </section>
    );
  }

  const participants = [
    { name: "あなた", isYou: true, stats: myStats },
    ...rivals.map((r) => ({
      name: r.name,
      isYou: false,
      stats: {
        logStreak: r.logStreak ?? 0,
        planStreak: r.planStreak ?? 0,
        comebackCount: r.comebackCount ?? 0,
        achievementRate: r.achievementRate ?? 0,
      },
    })),
  ];

  const leaderboard = [...participants]
    .map((p) => ({ ...p, score: scoreFrom(p.stats) }))
    .sort((a, b) => b.score - a.score);

  const podium = leaderboard.slice(0, 3).map((p, idx) => ({ ...p, rank: idx + 1 }));
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);
  const podiumHeights = [92, 120, 84];

  return (
    <section className="space-y-4">
      <div className="rounded-[var(--radius-xl)] border border-border bg-bg-muted p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">コミュニティ・リーダーボード</h2>
          <span className="text-[11px] text-fg-muted">総合スコア</span>
        </div>
        <div className="relative mt-6">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[140px] rounded-[var(--radius-xl)] bg-gradient-to-b from-primary/15 to-transparent" />
          <div className="confetti">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={`confetti-${i}`}
                style={{
                  left: `${(i * 7) % 100}%`,
                  top: `${(i * 11) % 40}%`,
                  background:
                    i % 3 === 0
                      ? "var(--color-primary)"
                      : i % 3 === 1
                      ? "var(--color-accent)"
                      : "var(--color-reward)",
                  animationDelay: `${(i % 6) * 0.2}s`,
                }}
              />
            ))}
          </div>
          <div className="relative grid grid-cols-3 items-end gap-3">
            {podiumOrder.map((p, i) => {
              const isFirst = i === 1;
              const height = podiumHeights[i];
              return (
                <div
                  key={p.name}
                  className={`relative rounded-[var(--radius-lg)] border border-border p-3 text-center ${
                    isFirst ? "bg-primary-soft/70 text-primary shadow-[var(--shadow-card)]" : "bg-bg-subtle text-foreground"
                  }`}
                  style={{ height }}
                >
                  {isFirst && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-primary-contrast px-2 py-0.5 rounded-[999px] shadow-[var(--shadow-button)]">
                      CHAMPION
                    </div>
                  )}
                  {isFirst && (
                    <div className="podium-crown absolute -top-9 left-1/2 -translate-x-1/2">
                      <svg width="28" height="22" viewBox="0 0 64 48" fill="none" aria-hidden>
                        <path d="M6 38L14 14L32 30L50 14L58 38H6Z" fill="var(--color-streak)" />
                        <rect x="10" y="38" width="44" height="6" rx="3" fill="var(--color-streak)" />
                        <circle cx="14" cy="14" r="4" fill="var(--color-reward)" />
                        <circle cx="32" cy="30" r="4" fill="var(--color-reward)" />
                        <circle cx="50" cy="14" r="4" fill="var(--color-reward)" />
                      </svg>
                    </div>
                  )}
                  <div className={`mx-auto mb-2 h-14 w-14 rounded-[var(--radius-pill)] flex items-center justify-center font-bold ${
                    isFirst ? "bg-primary text-primary-contrast shadow-[var(--shadow-glow)]" : "bg-bg-muted"
                  }`}>
                    {initials(p.name)}
                  </div>
                  <p className="text-xs font-semibold">{p.name}</p>
                  <p className="text-[11px] text-fg-muted mt-0.5">{p.score} pts</p>
                  <p className="text-[10px] mt-1 text-fg-subtle">#{p.rank}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-bg-muted p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">指標別ランキング</h3>
        {METRICS.map((m) => {
          const entries = participants.map((p) => ({
            name: p.name,
            isYou: p.isYou,
            value: getValue(p.stats, m.key),
          }));
          const max = Math.max(1, ...entries.map((e) => e.value));
          return (
            <div key={m.key} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-fg-muted">
                <span>{m.label}</span>
                <span>最大 {m.format(max)}</span>
              </div>
              <div className="space-y-2">
                {entries
                  .sort((a, b) => b.value - a.value)
                  .map((e, i) => (
                    <div
                      key={`${m.key}-${e.name}`}
                      className="rounded-[var(--radius-lg)] border border-border bg-bg-subtle/60 px-3 py-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${e.isYou ? "text-primary" : "text-foreground"}`}>
                          #{i + 1} {e.name}
                        </span>
                        <span className="text-fg-muted">{m.format(e.value)}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-[999px] bg-border/40 overflow-hidden">
                        <div
                          className="h-full rounded-[999px] bg-primary"
                          style={{ width: `${Math.max(4, (e.value / max) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
