import { auth } from "@/auth";
import prisma from "@/prisma/client";
import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "./route";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

function patchReq(id: string, body: unknown) {
  return new Request(`http://localhost/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("PATCH /api/admin/users/[id]", () => {
  beforeEach(async () => {
    vi.mocked(auth).mockReset();
    await prisma.user.deleteMany();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await PATCH(patchReq("u1", { roles: ["ADMIN"] }), {
      params: Promise.resolve({ id: "u1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated user is not ADMIN in the database", async () => {
    const regularUser = await prisma.user.create({
      data: { email: "regular@example.com", roles: ["WORSHIP"] },
    });
    // Even if JWT claims ADMIN, live DB roles do not include ADMIN -> 403
    vi.mocked(auth).mockResolvedValue({
      user: { id: regularUser.id, email: regularUser.email, roles: ["ADMIN"] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await PATCH(patchReq(regularUser.id, { roles: ["ADMIN"] }), {
      params: Promise.resolve({ id: regularUser.id }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 400 when admin tries to remove their own ADMIN role", async () => {
    const admin = await prisma.user.create({
      data: { email: "admin@example.com", roles: ["ADMIN"] },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: admin.id, email: admin.email, roles: ["ADMIN"] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await PATCH(patchReq(admin.id, { roles: ["WORSHIP"] }), {
      params: Promise.resolve({ id: admin.id }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid role value", async () => {
    const admin = await prisma.user.create({
      data: { email: "admin@example.com", roles: ["ADMIN"] },
    });
    const target = await prisma.user.create({
      data: { email: "target@example.com", roles: [] },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: admin.id, email: admin.email, roles: ["ADMIN"] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await PATCH(patchReq(target.id, { roles: ["SUPERADMIN"] }), {
      params: Promise.resolve({ id: target.id }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 when target user does not exist", async () => {
    const admin = await prisma.user.create({
      data: { email: "admin@example.com", roles: ["ADMIN"] },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: admin.id, email: admin.email, roles: ["ADMIN"] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await PATCH(
      patchReq("non-existent-id", { roles: ["WORSHIP"] }),
      {
        params: Promise.resolve({ id: "non-existent-id" }),
      }
    );
    expect(res.status).toBe(404);
  });

  it("allows an ADMIN to assign multiple roles and clear them", async () => {
    const admin = await prisma.user.create({
      data: { email: "admin@example.com", roles: ["ADMIN"] },
    });
    const target = await prisma.user.create({
      data: { email: "target@example.com", roles: [] },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: admin.id, email: admin.email, roles: ["ADMIN"] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const assignRes = await PATCH(
      patchReq(target.id, { roles: ["WORSHIP", "MEDIA", "WORSHIP"] }),
      {
        params: Promise.resolve({ id: target.id }),
      }
    );
    expect(assignRes.status).toBe(200);
    expect(await assignRes.json()).toEqual({
      id: target.id,
      roles: ["WORSHIP", "MEDIA"],
    });

    const inDb = await prisma.user.findUnique({ where: { id: target.id } });
    expect(inDb?.roles).toEqual(["WORSHIP", "MEDIA"]);

    const clearRes = await PATCH(patchReq(target.id, { roles: [] }), {
      params: Promise.resolve({ id: target.id }),
    });
    expect(clearRes.status).toBe(200);
    expect(await clearRes.json()).toEqual({ id: target.id, roles: [] });
  });
});
