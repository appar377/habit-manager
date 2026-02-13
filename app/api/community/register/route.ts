import { NextResponse } from "next/server";
import { getOrCreateUser, getUserRow } from "@/lib/user";
import { updateUserDisplayName } from "@/lib/models/users";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const displayName = typeof body.displayName === "string" && body.displayName.trim()
    ? body.displayName.trim()
    : "ユーザー";

  const user = await getOrCreateUser(displayName);
  const row = await getUserRow(user.id);
  if (!row) {
    return NextResponse.json({ error: "user_not_found" }, { status: 500 });
  }
  if (displayName && displayName !== row.display_name) {
    await updateUserDisplayName(row.id, displayName);
  }
  return NextResponse.json({
    userId: row.id,
    secret: row.secret,
    friendCode: row.friend_code,
    displayName,
  });
}
