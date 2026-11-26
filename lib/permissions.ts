import type { UserRole } from "@prisma/client";

/**
 * Assignable team/admin roles stored in User.roles.
 * Regular signed-in users without any special role have an empty array ([]).
 */
export const ASSIGNABLE_ROLES = ["ADMIN", "WORSHIP", "MEDIA"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export function hasRole(
  roles: readonly UserRole[] | null | undefined,
  role: UserRole
): boolean {
  return Array.isArray(roles) && roles.includes(role);
}

export function isAdmin(roles: readonly UserRole[] | null | undefined): boolean {
  return hasRole(roles, "ADMIN");
}

export function canAccessAdmin(
  roles: readonly UserRole[] | null | undefined
): boolean {
  return isAdmin(roles);
}

/**
 * Teams that can view official church liturgies (MEDIA, WORSHIP, ADMIN).
 */
export function canViewChurchServices(
  roles: readonly UserRole[] | null | undefined
): boolean {
  return (
    hasRole(roles, "ADMIN") ||
    hasRole(roles, "WORSHIP") ||
    hasRole(roles, "MEDIA")
  );
}

/**
 * Teams that can edit items in church liturgies (MEDIA, WORSHIP, ADMIN).
 */
export function canEditChurchServices(
  roles: readonly UserRole[] | null | undefined
): boolean {
  return canViewChurchServices(roles);
}

/**
 * Teams that can create or delete official church liturgies (WORSHIP, ADMIN).
 */
export function canManageChurchServices(
  roles: readonly UserRole[] | null | undefined
): boolean {
  return hasRole(roles, "ADMIN") || hasRole(roles, "WORSHIP");
}

/**
 * Teams that can create/edit songs and arrangements (WORSHIP, ADMIN).
 */
export function canEditSongs(
  roles: readonly UserRole[] | null | undefined
): boolean {
  return hasRole(roles, "ADMIN") || hasRole(roles, "WORSHIP");
}

/**
 * Quem vê o uso das músicas em liturgias (última vez, quantidade, "Uso em liturgias"):
 * a equipe que monta e usa os cultos (MEDIA, WORSHIP, ADMIN). Visitantes e usuários comuns não.
 */
export function canSeeUsageStats(
  roles: readonly UserRole[] | null | undefined
): boolean {
  return canViewChurchServices(roles);
}
