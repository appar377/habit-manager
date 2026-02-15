import { NextResponse } from "next/server";
import { verifyLogin, USER_ID_COOKIE, USER_SECRET_COOKIE } from "@/lib/user";
import { cookies } from "next/headers";

const COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "メールアドレスとパスワードを入力してください" }, { status: 400 });
    }
    const { id, secret } = await verifyLogin(email, password);
    const cookieStore = await cookies();
    cookieStore.set(USER_ID_COOKIE, id, COOKIE_OPTIONS);
    cookieStore.set(USER_SECRET_COOKIE, secret, COOKIE_OPTIONS);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg === "invalid_credentials" || msg === "email_required") {
      return NextResponse.json({ error: "メールアドレスまたはパスワードが正しくありません" }, { status: 401 });
    }
    return NextResponse.json({ error: "ログインに失敗しました" }, { status: 500 });
  }
}
