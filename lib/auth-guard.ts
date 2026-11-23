import { auth } from "@/auth";
import { isE2ETestMode } from "@/lib/auth-utils";
import {
  canAccessAdmin,
  canEditChurchServices,
  canEditSongs,
  canManageChurchServices,
  canViewChurchServices,
} from "@/lib/permissions";
import prisma from "@/prisma/client";
import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export type LiveUserAuth =
  | { authenticated: false; userId: null; roles: UserRole[] }
  | { authenticated: true; userId: string; roles: UserRole[] };

/**
 * Fetches the current user's live roles from PostgreSQL so promotions and revocations
 * take effect immediately (never relying solely on stale JWT claims).
 * In E2E test mode (non-production, non-Vercel), respects the mock session roles.
 */
export async function getLiveUserAuth(): Promise<LiveUserAuth> {
  const session = await auth();
  if (!session?.user?.id) {
    return { authenticated: false, userId: null, roles: [] };
  }

  if (isE2ETestMode() && session.user.id === "test-user-id") {
    return {
      authenticated: true,
      userId: session.user.id,
      roles: Array.isArray(session.user.roles) ? session.user.roles : [],
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, roles: true },
  });

  if (!dbUser) {
    return { authenticated: false, userId: null, roles: [] };
  }

  return {
    authenticated: true,
    userId: dbUser.id,
    roles: dbUser.roles,
  };
}

export type PermissionGuardResult =
  | { ok: true; userId: string; roles: UserRole[] }
  | { ok: false; response: NextResponse };

export async function requirePermission(
  check: (roles: readonly UserRole[]) => boolean
): Promise<PermissionGuardResult> {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!check(live.roles)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: live.userId, roles: live.roles };
}

export function requireAdmin(): Promise<PermissionGuardResult> {
  return requirePermission(canAccessAdmin);
}

export function requireChurchServiceViewer(): Promise<PermissionGuardResult> {
  return requirePermission(canViewChurchServices);
}

export function requireChurchServiceEditor(): Promise<PermissionGuardResult> {
  return requirePermission(canEditChurchServices);
}

export function requireChurchServiceManager(): Promise<PermissionGuardResult> {
  return requirePermission(canManageChurchServices);
}

export function requireSongEditor(): Promise<PermissionGuardResult> {
  return requirePermission(canEditSongs);
}
