import { NextResponse } from "next/server";
import { createUserForSignup, USER_ID_COOKIE, USER_SECRET_COOKIE } from "@/lib/user";
import { cookies } from "next/headers";

const COOKIE_OPTIONS = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, displayName } = body;
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "email と password は必須です" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "パスワードは6文字以上にしてください" }, { status: 400 });
    }
    const { id, secret } = await createUserForSignup({
      email,
      password,
      displayName: typeof displayName === "string" ? displayName.trim() || "ユーザー" : "ユーザー",
    });
    const cookieStore = await cookies();
    cookieStore.set(USER_ID_COOKIE, id, COOKIE_OPTIONS);
    cookieStore.set(USER_SECRET_COOKIE, secret, COOKIE_OPTIONS);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    if (msg === "email_taken") {
      return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 400 });
    }
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}
