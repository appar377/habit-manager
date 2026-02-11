import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/google";
import { getOrCreateUser } from "@/lib/user";
import { upsertIntegration } from "@/lib/calendar-db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = req.headers.get("cookie") ?? "";
  const storedState = cookies.match(/g_state=([^;]+)/)?.[1];

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/settings?google=error", url.origin));
  }

  const user = await getOrCreateUser();
  const token = await exchangeCode(code);
  const tokenExpiry = new Date(Date.now() + token.expires_in * 1000).toISOString();

  await upsertIntegration(user.id, {
    accessToken: token.access_token,
    refreshToken: token.refresh_token ?? null,
    tokenExpiry,
  });

  const res = NextResponse.redirect(new URL("/settings?google=connected", url.origin));
  res.cookies.set("g_state", "", { path: "/", maxAge: 0 });
  return res;
}
