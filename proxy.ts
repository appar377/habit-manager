import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // 静的アセット・manifest は対象外（401 は Vercel Deployment Protection 由来の可能性大）
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon).*)"],
};
