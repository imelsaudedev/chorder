import { getLiveUserAuth } from "@/lib/auth-guard";
import { getNotificationsForUser } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function GET() {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getNotificationsForUser(live.userId);
  return NextResponse.json(data);
}
