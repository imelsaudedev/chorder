import { auth } from "@/auth";
import prisma from "@/prisma/client";
import { NextResponse } from "next/server";

export type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Verifies that the current request belongs to an authenticated ADMIN user,
 * checking the live database role so promotions and revocations take effect immediately.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: dbUser.id };
}
