import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import type { HabitType } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const includeArchived = searchParams.get("archived") === "1";
  const habits = store.listHabits(includeArchived);
  return NextResponse.json({ habits });
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    name,
    type,
    targetSets,
    targetReps,
    targetMin,
    scheduleEnabled,
    scheduleRule,
    scheduleIntervalDays,
    scheduleWeekdays,
    scheduleStart,
    scheduleEnd,
    priority,
  } = body;
  if (!name || typeof name !== "string" || !type) {
    return NextResponse.json(
      { error: "name and type are required" },
      { status: 400 }
    );
  }
  if (type !== "exercise" && type !== "study") {
    return NextResponse.json({ error: "type must be exercise or study" }, { status: 400 });
  }
  const habit = store.addHabit({
    name: String(name).trim(),
    type: type as HabitType,
    targetSets: targetSets != null ? Number(targetSets) : undefined,
    targetReps: targetReps != null ? Number(targetReps) : undefined,
    targetMin: targetMin != null ? Number(targetMin) : undefined,
    scheduleEnabled: scheduleEnabled != null ? Boolean(scheduleEnabled) : undefined,
    scheduleRule: scheduleRule ?? undefined,
    scheduleIntervalDays:
      scheduleIntervalDays != null ? Number(scheduleIntervalDays) : undefined,
    scheduleWeekdays: Array.isArray(scheduleWeekdays) ? scheduleWeekdays : undefined,
    scheduleStart: scheduleStart ?? undefined,
    scheduleEnd: scheduleEnd ?? undefined,
    priority: priority != null ? Number(priority) : undefined,
  });
  return NextResponse.json({ habit }, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const {
    id,
    name,
    type,
    targetSets,
    targetReps,
    targetMin,
    archived,
    scheduleEnabled,
    scheduleRule,
    scheduleIntervalDays,
    scheduleWeekdays,
    scheduleStart,
    scheduleEnd,
    priority,
  } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const partial: Record<string, unknown> = {};
  if (name !== undefined) partial.name = String(name).trim();
  if (type !== undefined) partial.type = type;
  if (targetSets !== undefined) partial.targetSets = Number(targetSets);
  if (targetReps !== undefined) partial.targetReps = Number(targetReps);
  if (targetMin !== undefined) partial.targetMin = Number(targetMin);
  if (archived !== undefined) partial.archived = Boolean(archived);
  if (scheduleEnabled !== undefined) partial.scheduleEnabled = Boolean(scheduleEnabled);
  if (scheduleRule !== undefined) partial.scheduleRule = scheduleRule;
  if (scheduleIntervalDays !== undefined)
    partial.scheduleIntervalDays = Number(scheduleIntervalDays);
  if (scheduleWeekdays !== undefined)
    partial.scheduleWeekdays = Array.isArray(scheduleWeekdays) ? scheduleWeekdays : undefined;
  if (scheduleStart !== undefined) partial.scheduleStart = scheduleStart;
  if (scheduleEnd !== undefined) partial.scheduleEnd = scheduleEnd;
  if (priority !== undefined) partial.priority = Number(priority);
  const habit = store.updateHabit(id, partial as Parameters<typeof store.updateHabit>[1]);
  if (!habit) return NextResponse.json({ error: "habit not found" }, { status: 404 });
  return NextResponse.json({ habit });
}
