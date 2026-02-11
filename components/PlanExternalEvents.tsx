"use client";

type Props = {
  events: {
    id: string;
    summary: string | null;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    htmlLink: string | null;
  }[];
};

function toTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function PlanExternalEvents({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold text-fg-muted">Googleカレンダー</h2>
      <ul className="space-y-2">
        {events.map((e) => (
          <li
            key={e.id}
            className="rounded-[var(--radius-lg)] border border-border bg-bg-muted px-3 py-2 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {e.summary ?? "予定"}
                </p>
                <p className="text-xs text-fg-muted mt-0.5">
                  {toTime(e.startTime)}{e.endTime ? `–${toTime(e.endTime)}` : ""}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
              </div>
              {e.htmlLink && (
                <a
                  href={e.htmlLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary whitespace-nowrap"
                >
                  開く
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
