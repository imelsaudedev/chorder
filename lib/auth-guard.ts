import { auth } from "@/auth";
import { isE2ETestMode } from "@/lib/auth-utils";
import {
  canAccessAdmin,
  canEditChurchServices,
  canEditSongs,
  canManageChurchServices,
  canViewChurchServices,
} from "@/lib/permissions";
import {
  parseRolePreviewCookie,
  ROLE_PREVIEW_COOKIE_NAME,
} from "@/lib/role-preview";
import prisma from "@/prisma/client";
import type { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type LiveUserAuth =
  | {
      authenticated: false;
      userId: null;
      roles: UserRole[];
      realRoles: UserRole[];
      isPreviewing: false;
    }
  | {
      authenticated: true;
      userId: string;
      roles: UserRole[];
      realRoles: UserRole[];
      isPreviewing: boolean;
    };

async function readRolePreviewCookieSafe(): Promise<UserRole[] | null> {
  try {
    const store = await cookies();
    const raw = store.get(ROLE_PREVIEW_COOKIE_NAME)?.value;
    return parseRolePreviewCookie(raw);
  } catch {
    // Outside a Next.js request context (e.g. unit/integration tests)
    return null;
  }
}

/**
 * Fetches the current user's live roles from PostgreSQL so promotions and revocations
 * take effect immediately (never relying solely on stale JWT claims).
 * If the live user is a real ADMIN and has an active role-preview cookie, returns the
 * simulated roles in `roles` while preserving `realRoles` and `isPreviewing: true`.
 * Non-admins can never activate role preview (cookie is ignored).
 * In E2E test mode (non-production, non-Vercel), respects the mock session roles.
 */
export async function getLiveUserAuth(): Promise<LiveUserAuth> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      authenticated: false,
      userId: null,
      roles: [],
      realRoles: [],
      isPreviewing: false,
    };
  }

  let userId: string;
  let realRoles: UserRole[];

  if (isE2ETestMode() && session.user.id === "test-user-id") {
    userId = session.user.id;
    realRoles = Array.isArray(session.user.roles) ? session.user.roles : [];
  } else {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, roles: true },
    });

    if (!dbUser) {
      return {
        authenticated: false,
        userId: null,
        roles: [],
        realRoles: [],
        isPreviewing: false,
      };
    }

    userId = dbUser.id;
    realRoles = dbUser.roles;
  }

  if (canAccessAdmin(realRoles)) {
    const previewRoles = await readRolePreviewCookieSafe();
    if (previewRoles !== null) {
      return {
        authenticated: true,
        userId,
        roles: previewRoles,
        realRoles,
        isPreviewing: true,
      };
    }
  }

  return {
    authenticated: true,
    userId,
    roles: realRoles,
    realRoles,
    isPreviewing: false,
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

/**
 * Checks the user's real (non-simulated) ADMIN role so an admin who is currently
 * previewing another role can always change or exit preview mode.
 */
export async function requireRealAdmin(): Promise<PermissionGuardResult> {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!canAccessAdmin(live.realRoles)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: live.userId, roles: live.realRoles };
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
