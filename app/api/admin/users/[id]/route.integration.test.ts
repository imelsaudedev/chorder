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
    const res = await PATCH(patchReq("u1", { role: "ADMIN" }), {
      params: Promise.resolve({ id: "u1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated user is not ADMIN in the database", async () => {
    const regularUser = await prisma.user.create({
      data: { email: "regular@example.com", role: "USER" },
    });
    // Even if JWT claims ADMIN, live DB role is USER -> 403
    vi.mocked(auth).mockResolvedValue({
      user: { id: regularUser.id, email: regularUser.email, role: "ADMIN" },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await PATCH(patchReq(regularUser.id, { role: "ADMIN" }), {
      params: Promise.resolve({ id: regularUser.id }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 400 when admin tries to demote themselves", async () => {
    const admin = await prisma.user.create({
      data: { email: "admin@example.com", role: "ADMIN" },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: admin.id, email: admin.email, role: "ADMIN" },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await PATCH(patchReq(admin.id, { role: "USER" }), {
      params: Promise.resolve({ id: admin.id }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid role value", async () => {
    const admin = await prisma.user.create({
      data: { email: "admin@example.com", role: "ADMIN" },
    });
    const target = await prisma.user.create({
      data: { email: "target@example.com", role: "USER" },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: admin.id, email: admin.email, role: "ADMIN" },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await PATCH(patchReq(target.id, { role: "SUPERADMIN" }), {
      params: Promise.resolve({ id: target.id }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 when target user does not exist", async () => {
    const admin = await prisma.user.create({
      data: { email: "admin@example.com", role: "ADMIN" },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: admin.id, email: admin.email, role: "ADMIN" },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await PATCH(patchReq("non-existent-id", { role: "ADMIN" }), {
      params: Promise.resolve({ id: "non-existent-id" }),
    });
    expect(res.status).toBe(404);
  });

  it("allows an ADMIN to promote a USER to ADMIN and demote back to USER", async () => {
    const admin = await prisma.user.create({
      data: { email: "admin@example.com", role: "ADMIN" },
    });
    const target = await prisma.user.create({
      data: { email: "target@example.com", role: "USER" },
    });
    vi.mocked(auth).mockResolvedValue({
      user: { id: admin.id, email: admin.email, role: "ADMIN" },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const promoteRes = await PATCH(patchReq(target.id, { role: "ADMIN" }), {
      params: Promise.resolve({ id: target.id }),
    });
    expect(promoteRes.status).toBe(200);
    expect(await promoteRes.json()).toEqual({ id: target.id, role: "ADMIN" });

    const inDbAfterPromote = await prisma.user.findUnique({
      where: { id: target.id },
    });
    expect(inDbAfterPromote?.role).toBe("ADMIN");

    const demoteRes = await PATCH(patchReq(target.id, { role: "USER" }), {
      params: Promise.resolve({ id: target.id }),
    });
    expect(demoteRes.status).toBe(200);
    expect(await demoteRes.json()).toEqual({ id: target.id, role: "USER" });

    const inDbAfterDemote = await prisma.user.findUnique({
      where: { id: target.id },
    });
    expect(inDbAfterDemote?.role).toBe("USER");
  });
});
