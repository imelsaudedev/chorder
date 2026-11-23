import { requireAdmin } from "@/lib/auth-guard";
import { ASSIGNABLE_ROLES } from "@/lib/permissions";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateUserRolesSchema = z.object({
  roles: z.array(z.enum(ASSIGNABLE_ROLES)),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateUserRolesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Roles must be an array of ADMIN, WORSHIP, or MEDIA" },
      { status: 400 }
    );
  }

  const roles = Array.from(new Set(parsed.data.roles));

  if (id === admin.userId && !roles.includes("ADMIN")) {
    return NextResponse.json(
      { error: "Cannot remove your own admin role" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { roles },
    select: { id: true, roles: true },
  });

  return NextResponse.json(updated);
}
