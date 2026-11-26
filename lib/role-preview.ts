import { ASSIGNABLE_ROLES } from "@/lib/permissions";
import type { UserRole } from "@prisma/client";

export const ROLE_PREVIEW_COOKIE_NAME = "chorder_role_preview";

const ASSIGNABLE_SET = new Set<string>(ASSIGNABLE_ROLES);

/**
 * Parses the admin role-preview cookie.
 * - `undefined` → preview mode is not active (`null`).
 * - `""` → simulating a regular user with no team roles (`[]`).
 * - `"MEDIA,WORSHIP"` → simulating those specific roles.
 */
export function parseRolePreviewCookie(
  raw: string | undefined
): UserRole[] | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return [];

  const parsed = Array.from(
    new Set(
      trimmed
        .split(",")
        .map((r) => r.trim())
        .filter((r): r is UserRole => ASSIGNABLE_SET.has(r))
    )
  );
  return parsed;
}

export function serializeRolePreviewCookie(roles: readonly UserRole[]): string {
  return Array.from(
    new Set(roles.filter((r) => ASSIGNABLE_SET.has(r)))
  ).join(",");
}
