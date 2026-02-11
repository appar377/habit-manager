import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/google";
import { getOrCreateUser } from "@/lib/user";

export async function GET() {
  await getOrCreateUser();
  const state = crypto.randomUUID();
  const url = buildAuthUrl(state);
  const res = NextResponse.redirect(url);
  res.cookies.set("g_state", state, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
