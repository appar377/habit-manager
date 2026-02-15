import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";

/** ログイン状態を確認。200 = ログイン済み、401 = 未ログイン */
export async function GET() {
  try {
    await getOrCreateUser();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
