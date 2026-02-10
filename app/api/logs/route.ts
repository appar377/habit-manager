import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { listLogs, addLog, deleteLogByHabitAndDate } from "@/lib/db-store";

export async function GET(req: Request) {
  const user = await getOrCreateUser();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? undefined;
  return NextResponse.json({ logs: await listLogs(user.id, date) });
}

export async function POST(req: Request) {
  const user = await getOrCreateUser();
  const body = await req.json();
  const log = await addLog(user.id, {
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
  const user = await getOrCreateUser();
  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habitId");
  const date = searchParams.get("date");
  if (!habitId || !date) {
    return NextResponse.json(
      { error: "habitId and date are required" },
      { status: 400 }
    );
  }
  const removed = await deleteLogByHabitAndDate(user.id, habitId, date);
  return NextResponse.json({ removed });
}
