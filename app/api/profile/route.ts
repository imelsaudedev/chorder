import { getLiveUserAuth } from "@/lib/auth-guard";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export async function PATCH(request: NextRequest) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: live.userId },
    data: { name: parsed.data.name },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return NextResponse.json(updated);
}
