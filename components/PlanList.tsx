"use client";

import { useState, useEffect } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleTodoCompletionAction, updatePlanOrderAction } from "@/lib/actions";
import CheckCircle from "@/components/ui/CheckCircle";

const DRAG_DATA_KEY = "habit-manager/plan-order";

type TodoItem = {
  habitId: string;
  title: string;
  start: string;
  end: string;
  priority?: number;
};

type Props = {
  todos: TodoItem[];
  completedIds: Set<string>;
  date: string;
};

const DEFAULT_PRIORITY = 99;

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function getPriorityLabel(priority: number): string {
  if (priority <= 1) return "最優先";
  if (priority <= 2) return "高";
  if (priority <= 3) return "中";
  if (priority <= 5) return "低";
  return "通常";
}

function getPriorityStyles(priority: number): {
  borderClass: string;
  badgeClass: string;
  orderLabel: string;
} {
  if (priority <= 1) {
    return {
      borderClass: "border-l-4 border-l-amber-500 dark:border-l-amber-400",
      badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
      orderLabel: "1",
    };
  }
  if (priority <= 2) {
    return {
      borderClass: "border-l-4 border-l-sky-500 dark:border-l-sky-400",
      badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
      orderLabel: "2",
    };
  }
  if (priority <= 3) {
    return {
      borderClass: "border-l-4 border-l-emerald-500 dark:border-l-emerald-400",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
      orderLabel: "3",
    };
  }
  if (priority <= 5) {
    return {
      borderClass: "border-l-4 border-l-neutral-300 dark:border-l-neutral-500",
      badgeClass: "bg-neutral-100 text-neutral-600 dark:bg-neutral-700/50 dark:text-neutral-300",
      orderLabel: String(priority),
    };
  }
  return {
    borderClass: "border-l-4 border-l-transparent",
    badgeClass: "bg-neutral-100 text-neutral-500 dark:bg-neutral-700/50 dark:text-neutral-400",
    orderLabel: "—",
  };
}

/** 時間指定なしのTODOをリスト表示。優先度で装飾。ドラッグで並び替え。 */
export default function PlanList({ todos, completedIds, date }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [orderedTodos, setOrderedTodos] = useState<TodoItem[]>(todos);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    setOrderedTodos(todos);
  }, [todos]);

  const handleToggle = (todo: TodoItem) => {
    const completed = completedIds.has(todo.habitId);
    startTransition(async () => {
      await toggleTodoCompletionAction(todo.habitId, date, !completed, {
        start: todo.start,
        end: todo.end,
      });
      router.refresh();
    });
  };

  const handleDragStart = (e: React.DragEvent, habitId: string, index: number) => {
    e.dataTransfer.setData(DRAG_DATA_KEY, habitId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", habitId);
    setDraggingId(habitId);
    if (e.target instanceof HTMLElement) {
      e.target.setAttribute("data-dragging", "true");
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingId(null);
    setDropTargetIndex(null);
    if (e.target instanceof HTMLElement) {
      e.target.removeAttribute("data-dragging");
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (e.dataTransfer.types.includes(DRAG_DATA_KEY)) setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(null);
    const habitId = e.dataTransfer.getData(DRAG_DATA_KEY);
    if (!habitId) return;
    const sourceIndex = orderedTodos.findIndex((t) => t.habitId === habitId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;
    const next = [...orderedTodos];
    const [removed] = next.splice(sourceIndex, 1);
    const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    next.splice(insertIndex, 0, removed);
    setOrderedTodos(next);
    startTransition(async () => {
      await updatePlanOrderAction(next.map((t) => t.habitId));
      router.refresh();
    });
  };

  if (todos.length === 0) {
    return (
      <p className="text-sm text-neutral-500 py-6 text-center">
        今日の「時間指定なし」習慣はありません。習慣でスケジュールをONにし、開始・終了時刻を空にするとここに表示されます。
      </p>
    );
  }

  return (
    <ul className="space-y-3 list-none p-0 m-0" role="list" aria-label="時間指定なしの習慣（ドラッグで並び替え）">
      {orderedTodos.map((todo, index) => {
        const completed = completedIds.has(todo.habitId);
        const priority = todo.priority ?? DEFAULT_PRIORITY;
        const { borderClass, badgeClass, orderLabel } = getPriorityStyles(priority);
        const label = getPriorityLabel(priority);
        const isDragging = draggingId === todo.habitId;
        const isDropTarget = dropTargetIndex === index;
        return (
          <li
            key={todo.habitId}
            data-index={index}
            className={`flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50/50 dark:bg-neutral-800/50 transition-colors ${borderClass} ${isDragging ? "opacity-50" : ""} ${isDropTarget ? "ring-2 ring-amber-400 dark:ring-amber-500 ring-offset-2 dark:ring-offset-neutral-900" : ""}`}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, todo.habitId, index)}
              onDragEnd={handleDragEnd}
              className="shrink-0 p-1 -m-1 rounded cursor-grab active:cursor-grabbing touch-none text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 dark:hover:text-neutral-200"
              aria-label="並び替え用のつまみ"
              title="ドラッグで順序を変更"
            >
              <GripIcon />
            </div>
            <CheckCircle
              checked={completed}
              onToggle={() => handleToggle(todo)}
              disabled={isPending}
              aria-label={completed ? "完了（クリックで解除）" : "未完了（クリックで完了）"}
              aria-pressed={completed}
              title={completed ? "クリックで未完了に戻す" : "クリックで完了にする"}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded text-[10px] font-semibold tabular-nums ${badgeClass}`}
                  title={`表示優先度: ${label}`}
                >
                  {orderLabel}
                </span>
                <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                  {label}
                </span>
              </div>
              <p className={`font-medium truncate mt-0.5 ${completed ? "text-neutral-500 dark:text-neutral-400 line-through" : "text-foreground"}`}>
                {todo.title}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">いつでも</p>
            </div>
            {completed && (
              <span className="text-xs text-neutral-500 shrink-0">完了</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
