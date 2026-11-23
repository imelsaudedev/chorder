import type { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  canAccessAdmin,
  canEditChurchServices,
  canEditSongs,
  canManageChurchServices,
  canViewChurchServices,
  hasRole,
  isAdmin,
} from "./permissions";

describe("lib/permissions", () => {
  const unauthenticated: UserRole[] | undefined = undefined;
  const regularUser: UserRole[] = [];
  const mediaUser: UserRole[] = ["MEDIA"];
  const worshipUser: UserRole[] = ["WORSHIP"];
  const worshipAndMedia: UserRole[] = ["WORSHIP", "MEDIA"];
  const adminUser: UserRole[] = ["ADMIN"];

  it("checks individual roles safely", () => {
    expect(hasRole(unauthenticated, "ADMIN")).toBe(false);
    expect(hasRole(regularUser, "ADMIN")).toBe(false);
    expect(hasRole(worshipAndMedia, "WORSHIP")).toBe(true);
    expect(hasRole(worshipAndMedia, "MEDIA")).toBe(true);
    expect(hasRole(worshipAndMedia, "ADMIN")).toBe(false);
    expect(isAdmin(adminUser)).toBe(true);
  });

  it("restricts admin access strictly to ADMIN", () => {
    expect(canAccessAdmin(unauthenticated)).toBe(false);
    expect(canAccessAdmin(regularUser)).toBe(false);
    expect(canAccessAdmin(mediaUser)).toBe(false);
    expect(canAccessAdmin(worshipUser)).toBe(false);
    expect(canAccessAdmin(adminUser)).toBe(true);
  });

  it("allows MEDIA, WORSHIP, and ADMIN to view and edit church services", () => {
    expect(canViewChurchServices(unauthenticated)).toBe(false);
    expect(canViewChurchServices(regularUser)).toBe(false);
    expect(canViewChurchServices(mediaUser)).toBe(true);
    expect(canViewChurchServices(worshipUser)).toBe(true);
    expect(canViewChurchServices(adminUser)).toBe(true);

    expect(canEditChurchServices(regularUser)).toBe(false);
    expect(canEditChurchServices(mediaUser)).toBe(true);
    expect(canEditChurchServices(worshipUser)).toBe(true);
    expect(canEditChurchServices(adminUser)).toBe(true);
  });

  it("restricts creating/deleting church services and editing songs to WORSHIP and ADMIN", () => {
    expect(canManageChurchServices(regularUser)).toBe(false);
    expect(canManageChurchServices(mediaUser)).toBe(false);
    expect(canManageChurchServices(worshipUser)).toBe(true);
    expect(canManageChurchServices(worshipAndMedia)).toBe(true);
    expect(canManageChurchServices(adminUser)).toBe(true);

    expect(canEditSongs(unauthenticated)).toBe(false);
    expect(canEditSongs(regularUser)).toBe(false);
    expect(canEditSongs(mediaUser)).toBe(false);
    expect(canEditSongs(worshipUser)).toBe(true);
    expect(canEditSongs(adminUser)).toBe(true);
  });
});
