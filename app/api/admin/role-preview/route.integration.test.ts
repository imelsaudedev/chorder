import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { auth } from "@/auth";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { ROLE_PREVIEW_COOKIE_NAME } from "@/lib/role-preview";
import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

const mockCookieGet = vi.fn();

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: mockCookieGet })),
}));

beforeEach(async () => {
  mockCookieGet.mockReset();
  mockCookieGet.mockReturnValue(undefined);
  await prisma.user.deleteMany();
});

describe("POST /api/admin/role-preview & getLiveUserAuth preview", () => {
  it("rejects unauthenticated (401) and non-admin (403) callers, and ignores preview cookie for non-admins", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    const unauth = await POST(
      new NextRequest("http://localhost/api/admin/role-preview", {
        method: "POST",
        body: JSON.stringify({ roles: ["MEDIA"] }),
      })
    );
    expect(unauth.status).toBe(401);

    const regular = await prisma.user.create({
      data: { email: "user@test.com", name: "User", roles: ["WORSHIP"] },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: regular.id, email: regular.email, roles: ["WORSHIP"] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
    mockCookieGet.mockReturnValue({ value: "ADMIN" });

    // Forged cookie is completely ignored for non-admins
    const live = await getLiveUserAuth();
    expect(live.roles).toEqual(["WORSHIP"]);
    expect(live.isPreviewing).toBe(false);

    const forbidden = await POST(
      new NextRequest("http://localhost/api/admin/role-preview", {
        method: "POST",
        body: JSON.stringify({ roles: ["ADMIN"] }),
      })
    );
    expect(forbidden.status).toBe(403);
  });

  it("allows real ADMIN to simulate roles (including empty USER) and still reset while previewing", async () => {
    const admin = await prisma.user.create({
      data: { email: "admin@test.com", name: "Admin", roles: ["ADMIN"] },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: admin.id, email: admin.email, roles: ["ADMIN"] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    // 1. Set preview to MEDIA + WORSHIP
    const setRes = await POST(
      new NextRequest("http://localhost/api/admin/role-preview", {
        method: "POST",
        body: JSON.stringify({ roles: ["MEDIA", "WORSHIP"] }),
      })
    );
    expect(setRes.status).toBe(200);
    expect(setRes.cookies.get(ROLE_PREVIEW_COOKIE_NAME)?.value).toBe("MEDIA,WORSHIP");

    // 2. Simulate active cookie for regular USER ("")
    mockCookieGet.mockReturnValue({ value: "" });
    const livePreview = await getLiveUserAuth();
    expect(livePreview.authenticated).toBe(true);
    expect(livePreview.roles).toEqual([]);
    expect(livePreview.realRoles).toEqual(["ADMIN"]);
    expect(livePreview.isPreviewing).toBe(true);

    // 3. Even while previewing empty roles, real ADMIN can reset preview (roles: null)
    const resetRes = await POST(
      new NextRequest("http://localhost/api/admin/role-preview", {
        method: "POST",
        body: JSON.stringify({ roles: null }),
      })
    );
    expect(resetRes.status).toBe(200);
    const body = await resetRes.json();
    expect(body).toEqual({ roles: ["ADMIN"], isPreviewing: false });
    expect(resetRes.cookies.get(ROLE_PREVIEW_COOKIE_NAME)?.maxAge).toBe(0);
  });
});
