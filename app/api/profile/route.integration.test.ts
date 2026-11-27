import { PATCH } from "@/app/api/profile/route";
import prisma from "@/prisma/client";
import { NextRequest } from "next/server";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetLiveUserAuth } = vi.hoisted(() => ({
  mockGetLiveUserAuth: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({
  getLiveUserAuth: mockGetLiveUserAuth,
}));

function makePatchRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/profile integration", () => {
  const testEmail = "profile-integration-test@example.com";
  let userId: string;

  beforeEach(async () => {
    mockGetLiveUserAuth.mockReset();
    await prisma.user.deleteMany({ where: { email: testEmail } });
    const created = await prisma.user.create({
      data: {
        email: testEmail,
        name: null,
        roles: ["WORSHIP"],
      },
    });
    userId = created.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: false,
      userId: null,
      roles: [],
      realRoles: [],
      isPreviewing: false,
    });

    const res = await PATCH(makePatchRequest({ name: "Toshi" }));
    expect(res.status).toBe(401);
  });

  it("updates and trims name for the authenticated user", async () => {
    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: true,
      userId,
      roles: ["WORSHIP"],
      realRoles: ["WORSHIP"],
      isPreviewing: false,
    });

    const res = await PATCH(makePatchRequest({ name: "  Toshi  " }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Toshi");

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    expect(dbUser?.name).toBe("Toshi");
  });

  it("returns 400 when name is empty or whitespace", async () => {
    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: true,
      userId,
      roles: ["WORSHIP"],
      realRoles: ["WORSHIP"],
      isPreviewing: false,
    });

    const res = await PATCH(makePatchRequest({ name: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name exceeds 60 characters", async () => {
    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: true,
      userId,
      roles: ["WORSHIP"],
      realRoles: ["WORSHIP"],
      isPreviewing: false,
    });

    const res = await PATCH(makePatchRequest({ name: "a".repeat(61) }));
    expect(res.status).toBe(400);
  });
});
