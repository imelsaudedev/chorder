import { requireRealAdmin } from "@/lib/auth-guard";
import { ASSIGNABLE_ROLES } from "@/lib/permissions";
import {
  ROLE_PREVIEW_COOKIE_NAME,
  serializeRolePreviewCookie,
} from "@/lib/role-preview";
import type { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const rolePreviewBodySchema = z.object({
  roles: z.array(z.enum(ASSIGNABLE_ROLES)).nullable(),
});

export async function POST(request: NextRequest) {
  const guard = await requireRealAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const parsed = rolePreviewBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid roles" }, { status: 400 });
  }

  const secure = process.env.NODE_ENV === "production";

  if (parsed.data.roles === null) {
    const response = NextResponse.json({
      roles: guard.roles,
      isPreviewing: false,
    });
    response.cookies.set(ROLE_PREVIEW_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  const nextRoles: UserRole[] = Array.from(new Set(parsed.data.roles));
  const response = NextResponse.json({
    roles: nextRoles,
    isPreviewing: true,
  });
  response.cookies.set(
    ROLE_PREVIEW_COOKIE_NAME,
    serializeRolePreviewCookie(nextRoles),
    {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
    }
  );
  return response;
}
