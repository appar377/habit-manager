"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addHabitAction, updateHabitAction } from "@/lib/actions";
import type { Habit, ScheduleRule } from "@/lib/store";
import { roundTimeTo15 } from "@/lib/time";
import Pressable from "./ui/Pressable";
import Label from "./ui/Label";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
  /** 編集時は渡す。新規時は undefined */
  initial?: Habit;
  /** 成功時。新規追加の場合は作成された habit を渡す（一覧の即時反映用） */
  onSuccess: (createdHabit?: Habit) => void;
  onCancel?: () => void;
};

export default function HabitForm({ initial, onSuccess, onCancel }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
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
    setFormError(null);
    startTransition(async () => {
      if (isEdit) {
        const result = await updateHabitAction(initial!.id, {
          name: trimmed,
          type,
          targetSets: targetSets ? Number(targetSets) : undefined,
          targetReps: targetReps ? Number(targetReps) : undefined,
          targetMin: targetMin ? Number(targetMin) : undefined,
          ...schedulePayload,
        });
        if ("error" in result) {
          setFormError(result.error === "user_cookie_missing" ? "セッションがありません。ページを再読み込みしてください。" : "保存に失敗しました。");
          if (result.error === "user_cookie_missing") router.refresh();
          return;
        }
      } else {
        const result = await addHabitAction({
          name: trimmed,
          type,
          targetSets: targetSets ? Number(targetSets) : undefined,
          targetReps: targetReps ? Number(targetReps) : undefined,
          targetMin: targetMin ? Number(targetMin) : undefined,
          ...schedulePayload,
        });
        if ("error" in result) {
          setFormError(result.error === "user_cookie_missing" ? "セッションがありません。ページを再読み込みしてください。" : "保存に失敗しました。");
          if (result.error === "user_cookie_missing") router.refresh();
          return;
        }
        onSuccess(result.habit);
        return;
      }
      onSuccess();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-[var(--radius-xl)] border-2 border-border p-4 space-y-4 bg-bg-subtle">
      {formError && (
        <p className="text-sm text-danger bg-danger-soft/50 rounded-lg px-3 py-2" role="alert">
          {formError}
        </p>
      )}
      <div>
        <Label>名前</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="習慣の名前"
          required
        />
      </div>
      <div>
        <Label>タイプ</Label>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as "exercise" | "study")}
        >
          <option value="exercise">運動</option>
          <option value="study">学習</option>
        </Select>
      </div>
      {type === "exercise" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>目標セット数</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={targetSets}
              onChange={(e) => setTargetSets(e.target.value)}
              placeholder="10"
            />
          </div>
          <div>
            <Label>目標回数</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              placeholder="25"
            />
          </div>
        </div>
      ) : (
        <div>
          <Label>目標分数</Label>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={targetMin}
            onChange={(e) => setTargetMin(e.target.value)}
            placeholder="90"
          />
        </div>
      )}

      <fieldset className="rounded-[var(--radius-xl)] border-2 border-border p-4 space-y-3 bg-bg-muted">
        <legend className="text-xs font-medium text-fg-muted px-1">スケジュール（予定に表示）</legend>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={scheduleEnabled}
            onChange={(e) => setScheduleEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">スケジュールをON</span>
        </label>
        {scheduleEnabled && (
          <>
            <div>
              <Label>頻度</Label>
              <Select
                value={scheduleRule}
                onChange={(e) => setScheduleRule(e.target.value as ScheduleRule)}
              >
                <option value="daily">毎日</option>
                <option value="weekly">週の指定曜日</option>
                <option value="interval_days">N日ごと</option>
              </Select>
            </div>
            {scheduleRule === "weekly" && (
              <div>
                <Label>曜日</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {WEEKDAY_LABELS.map((label, d) => (
                    <Pressable
                      key={d}
                      onClick={() => toggleWeekday(d)}
                      className={`min-h-[36px] min-w-[36px] rounded-[var(--radius-md)] text-sm font-medium ${
                        scheduleWeekdays.includes(d)
                          ? "bg-foreground text-background"
                          : "bg-bg-subtle text-fg-muted"
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
                <Label>何日ごと</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={scheduleIntervalDays}
                  onChange={(e) => setScheduleIntervalDays(e.target.value)}
                  placeholder="1"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>開始（15分単位）</Label>
                <Input
                  type="time"
                  step={900}
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(roundTimeTo15(e.target.value))}
                />
              </div>
              <div>
                <Label>終了（15分単位）</Label>
                <Input
                  type="time"
                  step={900}
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(roundTimeTo15(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label>表示優先度</Label>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="1が最優先・空で低"
              />
              <p className="text-[11px] text-fg-muted mt-0.5">予定タブでの表示順。小さいほど上に表示されます。</p>
            </div>
          </>
        )}
      </fieldset>

      <div className="flex gap-2">
        <Button type="submit" fullWidth disabled={isPending || !name.trim()}>
          {isPending ? "保存中…" : isEdit ? "更新" : "追加"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" className="whitespace-nowrap min-w-[100px]" onClick={onCancel}>
            キャンセル
          </Button>
        )}
      </div>
    </form>
  );
}
