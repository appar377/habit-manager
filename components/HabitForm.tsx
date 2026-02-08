"use client";

import { useState, useTransition } from "react";
import { addHabitAction, updateHabitAction } from "@/lib/actions";
import type { Habit, ScheduleRule } from "@/lib/store";
import { roundTimeTo15 } from "@/lib/time";
import Pressable from "./ui/Pressable";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
  /** 編集時は渡す。新規時は undefined */
  initial?: Habit;
  onSuccess: () => void;
  onCancel?: () => void;
};

export default function HabitForm({ initial, onSuccess, onCancel }: Props) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<"exercise" | "study">(initial?.type ?? "exercise");
  const [targetSets, setTargetSets] = useState(initial?.targetSets?.toString() ?? "");
  const [targetReps, setTargetReps] = useState(initial?.targetReps?.toString() ?? "");
  const [targetMin, setTargetMin] = useState(initial?.targetMin?.toString() ?? "");
  const [scheduleEnabled, setScheduleEnabled] = useState(initial?.scheduleEnabled ?? false);
  const [scheduleRule, setScheduleRule] = useState<ScheduleRule>(
    initial?.scheduleRule ?? "daily"
  );
  const [scheduleStart, setScheduleStart] = useState(
    initial?.scheduleStart ? roundTimeTo15(initial.scheduleStart) : "09:00"
  );
  const [scheduleEnd, setScheduleEnd] = useState(
    initial?.scheduleEnd ? roundTimeTo15(initial.scheduleEnd) : "10:00"
  );
  const [scheduleWeekdays, setScheduleWeekdays] = useState<number[]>(
    initial?.scheduleWeekdays ?? [1, 2, 3, 4, 5]
  );
  const [scheduleIntervalDays, setScheduleIntervalDays] = useState(
    initial?.scheduleIntervalDays?.toString() ?? "1"
  );
  const [priority, setPriority] = useState(
    initial?.priority != null ? String(initial.priority) : ""
  );

  const isEdit = !!initial;

  function toggleWeekday(d: number) {
    setScheduleWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const schedulePayload = {
      scheduleEnabled,
      scheduleRule,
      scheduleStart: scheduleEnabled ? scheduleStart : undefined,
      scheduleEnd: scheduleEnabled ? scheduleEnd : undefined,
      scheduleWeekdays: scheduleRule === "weekly" ? scheduleWeekdays : undefined,
      scheduleIntervalDays:
        scheduleRule === "interval_days" && scheduleIntervalDays
          ? Number(scheduleIntervalDays)
          : undefined,
      priority: priority !== "" ? Number(priority) : undefined,
    };
    startTransition(async () => {
      if (isEdit) {
        await updateHabitAction(initial!.id, {
          name: trimmed,
          type,
          targetSets: targetSets ? Number(targetSets) : undefined,
          targetReps: targetReps ? Number(targetReps) : undefined,
          targetMin: targetMin ? Number(targetMin) : undefined,
          ...schedulePayload,
        });
      } else {
        await addHabitAction({
          name: trimmed,
          type,
          targetSets: targetSets ? Number(targetSets) : undefined,
          targetReps: targetReps ? Number(targetReps) : undefined,
          targetMin: targetMin ? Number(targetMin) : undefined,
          ...schedulePayload,
        });
      }
      onSuccess();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 space-y-4 bg-neutral-50/50 dark:bg-neutral-800/50">
      <div>
        <label className="block text-xs text-neutral-500 mb-1">名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="習慣の名前"
          className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">タイプ</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "exercise" | "study")}
          className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
        >
          <option value="exercise">運動</option>
          <option value="study">学習</option>
        </select>
      </div>
      {type === "exercise" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">目標セット数</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={targetSets}
              onChange={(e) => setTargetSets(e.target.value)}
              placeholder="10"
              className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">目標回数</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              placeholder="25"
              className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">目標分数</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={targetMin}
            onChange={(e) => setTargetMin(e.target.value)}
            placeholder="90"
            className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
          />
        </div>
      )}

      <fieldset className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 space-y-3">
        <legend className="text-xs font-medium text-neutral-500 px-1">スケジュール（予定に表示）</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={scheduleEnabled}
            onChange={(e) => setScheduleEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">スケジュールをON</span>
        </label>
        {scheduleEnabled && (
          <>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">頻度</label>
              <select
                value={scheduleRule}
                onChange={(e) => setScheduleRule(e.target.value as ScheduleRule)}
                className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
              >
                <option value="daily">毎日</option>
                <option value="weekly">週の指定曜日</option>
                <option value="interval_days">N日ごと</option>
              </select>
            </div>
            {scheduleRule === "weekly" && (
              <div>
                <span className="block text-xs text-neutral-500 mb-2">曜日</span>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((label, d) => (
                    <Pressable
                      key={d}
                      onClick={() => toggleWeekday(d)}
                      className={`min-h-[36px] min-w-[36px] rounded-lg text-sm font-medium ${
                        scheduleWeekdays.includes(d)
                          ? "bg-foreground text-background"
                          : "bg-neutral-200 dark:bg-neutral-700"
                      }`}
                    >
                      {label}
                    </Pressable>
                  ))}
                </div>
              </div>
            )}
            {scheduleRule === "interval_days" && (
              <div>
                <label className="block text-xs text-neutral-500 mb-1">何日ごと</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={scheduleIntervalDays}
                  onChange={(e) => setScheduleIntervalDays(e.target.value)}
                  placeholder="1"
                  className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">開始（15分単位）</label>
                <input
                  type="time"
                  step={900}
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(roundTimeTo15(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">終了（15分単位）</label>
                <input
                  type="time"
                  step={900}
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(roundTimeTo15(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">表示優先度</label>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="1が最優先・空で低"
                className="w-full min-h-[44px] px-3 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-background"
              />
              <p className="text-[11px] text-neutral-400 mt-0.5">予定タブでの表示順。小さいほど上に表示されます。</p>
            </div>
          </>
        )}
      </fieldset>

      <div className="flex gap-2">
        <Pressable
          type="submit"
          disabled={isPending || !name.trim()}
          className="flex-1 min-h-[44px] rounded-lg bg-foreground text-background font-medium disabled:opacity-50"
        >
          {isPending ? "保存中…" : isEdit ? "更新" : "追加"}
        </Pressable>
        {onCancel && (
          <Pressable
            onClick={onCancel}
            className="min-h-[44px] px-4 rounded-lg border border-neutral-200 dark:border-neutral-600"
          >
            キャンセル
          </Pressable>
        )}
      </div>
    </form>
  );
}
