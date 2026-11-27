import { getLiveUserAuth } from "@/lib/auth-guard";
import { markNotificationsAsRead } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const markReadSchema = z.union([
  z.object({ all: z.literal(true) }),
  z.object({ ids: z.array(z.string().min(1)).min(1) }),
  z.object({
    type: z.enum(["NEW_USER_REGISTERED"]),
    entityIds: z.array(z.string().min(1)).optional(),
  }),
]);

export async function POST(request: NextRequest) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = markReadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updatedCount = await markNotificationsAsRead(live.userId, parsed.data);
  return NextResponse.json({ ok: true, updatedCount });
}
