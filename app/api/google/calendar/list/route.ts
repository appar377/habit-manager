import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user";
import { getValidAccessToken } from "@/lib/google-calendar";

export async function GET() {
  const user = await getOrCreateUser();
  let token: string;
  try {
    token = await getValidAccessToken(user.id);
  } catch {
    return NextResponse.json({ error: "google_not_connected" }, { status: 401 });
  }
  const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "calendar_list_failed" }, { status: 400 });
  }
  const json = await res.json();
  const items = (json.items ?? []).map((c: any) => ({
    id: c.id,
    summary: c.summary,
    accessRole: c.accessRole,
    primary: !!c.primary,
  }));
  return NextResponse.json({ calendars: items });
}
