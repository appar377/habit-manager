"use client";

import { useEffect, useState } from "react";
import Button from "./ui/Button";
import Select from "./ui/Select";

type CalendarItem = {
  id: string;
  summary: string;
  primary?: boolean;
};

export default function GoogleCalendarSettings() {
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function loadCalendars() {
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/google/calendar/list");
    if (!res.ok) {
      if (res.status === 401) {
        setStatus("idle");
        setCalendars([]);
        return;
      }
      setStatus("error");
      setError("Googleカレンダーに接続できませんでした。");
      return;
    }
    const data = await res.json();
    setCalendars(data.calendars ?? []);
    const primary = data.calendars?.find((c: CalendarItem) => c.primary);
    setSelected(primary?.id ?? data.calendars?.[0]?.id ?? "");
    setStatus("connected");
  }

  async function selectCalendar() {
    if (!selected) return;
    setStatus("loading");
    setError(null);
    const res = await fetch("/api/google/calendar/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarId: selected }),
    });
    if (!res.ok) {
      setStatus("error");
      setError("カレンダーの選択に失敗しました。");
      return;
    }
    setStatus("connected");
  }

  useEffect(() => {
    void loadCalendars();
  }, []);

  return (
    <section className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-muted p-4 shadow-[var(--shadow-card)] space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Googleカレンダー連携</h2>
        <p className="text-xs text-fg-muted">既存カレンダーの予定を同期します（planのみ）。</p>
      </div>

      {status === "error" && <p className="text-xs text-danger">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" className="min-h-[36px] px-3 text-xs" onClick={() => (window.location.href = "/api/google/oauth/start")}>
          Googleと接続
        </Button>
        <Button variant="ghost" className="min-h-[36px] px-3 text-xs" onClick={loadCalendars}>
          カレンダー再読み込み
        </Button>
      </div>

      {calendars.length > 0 && (
        <div className="space-y-2">
          <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {calendars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.summary}{c.primary ? "（メイン）" : ""}
              </option>
            ))}
          </Select>
          <Button variant="primary" className="min-h-[36px] px-4 text-xs" onClick={selectCalendar}>
            このカレンダーを同期
          </Button>
        </div>
      )}
    </section>
  );
}
