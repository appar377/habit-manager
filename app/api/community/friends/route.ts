import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/community-db";
import { validateUser, listFriendsWithStats } from "@/lib/repositories/community-repo";

export async function POST(req: Request) {
  await ensureSchema();
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId : "";
  const secret = typeof body.secret === "string" ? body.secret : "";

  if (!userId || !secret) {
    return NextResponse.json({ error: "missing_auth" }, { status: 400 });
  }

  const valid = await validateUser(userId, secret);
  if (!valid) {
    return NextResponse.json({ error: "invalid_auth" }, { status: 403 });
  }

  const friends = await listFriendsWithStats(userId);

  return NextResponse.json({ friends });
}
