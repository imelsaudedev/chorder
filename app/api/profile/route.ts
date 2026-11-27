import { getLiveUserAuth } from "@/lib/auth-guard";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  nickname: z.string().trim().max(60).nullable(),
});

export async function PATCH(request: NextRequest) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid nickname" }, { status: 400 });
  }

  const normalizedNickname = parsed.data.nickname?.trim() || null;

  const updated = await prisma.user.update({
    where: { id: live.userId },
    data: { nickname: normalizedNickname },
    select: {
      id: true,
      name: true,
      nickname: true,
      email: true,
      image: true,
    },
  });

  return NextResponse.json(updated);
}
