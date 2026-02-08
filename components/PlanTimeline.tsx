"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg, EventClickArg, EventInput } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import { toggleTodoCompletionAction, updatePlanOverrideAction } from "@/lib/actions";

const RANGE_START = "06:00:00";
const RANGE_END = "24:00:00";
/** 06:00〜24:00 の18時間を15分スロットで表示する高さ（px）。ラッパーがスクロールする。 */
const TOTAL_SLOTS = (18 * 60) / 15;
const SLOT_HEIGHT_PX = 24;
const TIMELINE_CONTENT_HEIGHT_PX = TOTAL_SLOTS * SLOT_HEIGHT_PX;

function dateToTimeStr(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type TodoItem = {
  habitId: string;
  title: string;
  start: string;
  end: string;
};

type Props = {
  todos: TodoItem[];
  completedIds: Set<string>;
  date: string;
};

export default function PlanTimeline({ todos, completedIds, date }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const events: EventInput[] = todos.map((t) => ({
    id: t.habitId,
    title: completedIds.has(t.habitId) ? `✓ ${t.title}` : t.title,
    start: `${date}T${t.start}:00`,
    end: `${date}T${t.end}:00`,
    extendedProps: {
      habitId: t.habitId,
      start: t.start,
      end: t.end,
      completed: completedIds.has(t.habitId),
    },
  }));

  const handleEventDrop = (info: EventDropArg) => {
    const e = info.event;
    const start = e.start;
    const end = e.end;
    if (!start || !end) return;
    const habitId = e.extendedProps.habitId as string;
    startTransition(async () => {
      const res = await updatePlanOverrideAction(date, habitId, {
        start: dateToTimeStr(start),
        end: dateToTimeStr(end),
      });
      if (res.error) info.revert();
      else router.refresh();
    });
  };

  const handleEventResize = (info: EventResizeDoneArg) => {
    const e = info.event;
    const start = e.start;
    const end = e.end;
    if (!start || !end) return;
    const habitId = e.extendedProps.habitId as string;
    startTransition(async () => {
      const res = await updatePlanOverrideAction(date, habitId, {
        start: dateToTimeStr(start),
        end: dateToTimeStr(end),
      });
      if (res.error) info.revert();
      else router.refresh();
    });
  };

  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    const habitId = info.event.extendedProps.habitId as string;
    const completed = info.event.extendedProps.completed as boolean;
    const start = info.event.start;
    const end = info.event.end;
    if (!start || !end) return;
    const timeRange = { start: dateToTimeStr(start), end: dateToTimeStr(end) };
    startTransition(async () => {
      await toggleTodoCompletionAction(habitId, date, !completed, timeRange);
      router.refresh();
    });
  };

  if (todos.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-6 text-center">
        今日のスケジュール習慣はありません。習慣編集でスケジュールをONにするとここに表示されます。
      </p>
    );
  }

  return (
    <div className="plan-timeline-wrapper min-w-0 -mx-4 md:-mx-0 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-y-auto overflow-x-hidden max-h-[75dvh] md:max-h-[70vh] min-h-[280px] overscroll-behavior-y-contain">
      <FullCalendar
        plugins={[interactionPlugin, timeGridPlugin]}
        initialView="timeGridDay"
        initialDate={date}
        slotMinTime={RANGE_START}
        slotMaxTime={RANGE_END}
        slotDuration="00:15:00"
        slotLabelInterval={{ minutes: 30 }}
        allDaySlot={false}
        headerToolbar={false}
        events={events}
        editable={true}
        eventDurationEditable={true}
        eventStartEditable={true}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventClick={handleEventClick}
        eventDisplay="block"
        height={TIMELINE_CONTENT_HEIGHT_PX}
        dayMaxEventRows={false}
        nowIndicator={false}
        locale="ja"
        firstDay={0}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        eventClassNames={(arg) =>
          arg.event.extendedProps.completed ? "fc-event-completed" : ""
        }
      />
    </div>
  );
}
