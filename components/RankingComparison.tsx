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
  { key: "logStreak", label: "記録", format: (v) => `${v}日` },
  { key: "planStreak", label: "達成", format: (v) => `${v}日` },
  { key: "comebackCount", label: "立ち上がり", format: (v) => `${v}回` },
  { key: "achievementRate", label: "達成率", format: (v) => `${Math.round(v * 100)}%` },
];

function getValue(stats: MyStats, key: keyof MyStats): number {
  return stats[key];
}

function getRivalValue(r: Rival, key: keyof MyStats): number | null {
  if (key === "achievementRate") return r.achievementRate ?? null;
  if (key === "logStreak") return r.logStreak ?? null;
  if (key === "planStreak") return r.planStreak ?? null;
  if (key === "comebackCount") return r.comebackCount ?? null;
  return null;
}

/** 各指標で1位のインデックス（0=自分, 1=rival[0], ...）を返す。 */
function getRankIndices(myStats: MyStats, rivals: Rival[], key: keyof MyStats): number[] {
  const myV = getValue(myStats, key);
  const values: { idx: number; v: number }[] = [{ idx: 0, v: myV }];
  rivals.forEach((r, i) => {
    const v = getRivalValue(r, key);
    if (v !== null) values.push({ idx: i + 1, v });
  });
  const max = Math.max(...values.map((x) => x.v));
  return values.filter((x) => x.v === max).map((x) => x.idx);
}

export default function RankingComparison({ myStats, rivals }: Props) {
  if (rivals.length === 0) {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-bg-subtle p-6 text-center">
        <h2 className="sr-only">比較</h2>
        <p className="text-sm text-fg-muted">ライバルを追加すると比較表が表示されます</p>
      </section>
    );
  }

  const participants = [{ name: "あなた", isYou: true }, ...rivals.map((r) => ({ name: r.name, isYou: false }))];

  return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-bg-muted p-4 overflow-x-auto">
      <h2 className="sr-only">比較</h2>
      <table className="w-full text-sm border-collapse min-w-[320px]">
        <thead>
          <tr>
            <th className="text-left py-2 pr-3 text-fg-muted font-medium w-28">指標</th>
            {participants.map((p) => (
              <th
                key={p.name}
                className={`py-2 px-2 font-semibold ${p.isYou ? "text-primary bg-primary-soft/50" : "text-foreground"}`}
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((m) => {
            const rankIndices = getRankIndices(myStats, rivals, m.key);
            return (
              <tr key={m.key} className="border-t border-border">
                <td className="py-2 pr-3 text-fg-muted">{m.label}</td>
                <td className="py-2 px-2">
                  <span className={rankIndices.includes(0) ? "font-bold text-primary" : ""}>
                    {m.format(getValue(myStats, m.key))}
                  </span>
                  {rankIndices.includes(0) && rankIndices.length <= participants.length && (
                    <span className="ml-1 text-[10px] text-primary font-medium">1位</span>
                  )}
                </td>
                {rivals.map((r, i) => {
                  const v = getRivalValue(r, m.key);
                  const idx = i + 1;
                  const isFirst = rankIndices.includes(idx);
                  return (
                    <td key={r.id} className="py-2 px-2">
                      {v !== null ? (
                        <>
                          <span className={isFirst ? "font-bold text-primary" : ""}>
                            {m.key === "achievementRate" ? m.format(v) : m.format(v)}
                          </span>
                          {isFirst && <span className="ml-1 text-[10px] text-primary font-medium">1位</span>}
                        </>
                      ) : (
                        <span className="text-fg-subtle">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
