import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? undefined;
  return NextResponse.json({ logs: store.listLogs(date) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const log = store.addLog({
    date: body.date,
    habitId: body.habitId,
    sets: body.sets ? Number(body.sets) : undefined,
    reps: body.reps ? Number(body.reps) : undefined,
    start: body.start,
    end: body.end,
  });
  return NextResponse.json({ log }, { status: 201 });
}

/** 指定日の該当習慣ログを削除（/plan のチェック解除用）。query: habitId, date */
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habitId");
  const date = searchParams.get("date");
  if (!habitId || !date) {
    return NextResponse.json(
      { error: "habitId and date are required" },
      { status: 400 }
    );
  }
  const removed = store.deleteLogByHabitAndDate(habitId, date);
  return NextResponse.json({ removed });
}
