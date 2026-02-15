import { NextResponse } from "next/server";
import { USER_ID_COOKIE, USER_SECRET_COOKIE } from "@/lib/user";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_ID_COOKIE);
  cookieStore.delete(USER_SECRET_COOKIE);
  return NextResponse.json({ ok: true });
}
