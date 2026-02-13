import { NextResponse } from "next/server";
import { ensureSchema, normalizeFriendCode } from "@/lib/community-db";
import { validateUser, addFriendByCode } from "@/lib/repositories/community-repo";

export async function POST(req: Request) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  const secret = typeof body.secret === "string" ? body.secret : "";
  const rawCode = typeof body.friendCode === "string" ? body.friendCode : "";
  const friendCode = normalizeFriendCode(rawCode);

  if (!userId || !secret || !friendCode) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const valid = await validateUser(userId, secret);
  if (!valid) {
    return NextResponse.json({ error: "invalid_auth" }, { status: 403 });
  }

  const result = await addFriendByCode(userId, friendCode);
  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
