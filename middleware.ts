import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USER_ID_COOKIE = "hm_uid";
const USER_SECRET_COOKIE = "hm_secret";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const hasId = req.cookies.get(USER_ID_COOKIE)?.value;
  const hasSecret = req.cookies.get(USER_SECRET_COOKIE)?.value;
  if (!hasId || !hasSecret) {
    const id = crypto.randomUUID();
    const secret = crypto.randomUUID();
    res.cookies.set(USER_ID_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/" });
    res.cookies.set(USER_SECRET_COOKIE, secret, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  return res;
}

export const config = {
  // 静的アセット・manifest はミドルウェア対象外（Vercel Deployment Protection 時も 401 の原因になり得る）
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon).*)"],
};
