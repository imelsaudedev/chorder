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
        name: "Original Google Name",
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

    const res = await PATCH(makePatchRequest({ nickname: "Toshi" }));
    expect(res.status).toBe(401);
  });

  it("sets and trims nickname for the authenticated user", async () => {
    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: true,
      userId,
      roles: ["WORSHIP"],
      realRoles: ["WORSHIP"],
      isPreviewing: false,
    });

    const res = await PATCH(makePatchRequest({ nickname: "  Toshi  " }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.nickname).toBe("Toshi");
    expect(data.name).toBe("Original Google Name");

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    expect(dbUser?.nickname).toBe("Toshi");
    expect(dbUser?.name).toBe("Original Google Name");
  });

  it("clears nickname to null when empty string is submitted", async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { nickname: "Toshi" },
    });

    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: true,
      userId,
      roles: ["WORSHIP"],
      realRoles: ["WORSHIP"],
      isPreviewing: false,
    });

    const res = await PATCH(makePatchRequest({ nickname: "   " }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.nickname).toBeNull();

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    expect(dbUser?.nickname).toBeNull();
  });

  it("returns 400 when nickname exceeds 60 characters", async () => {
    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: true,
      userId,
      roles: ["WORSHIP"],
      realRoles: ["WORSHIP"],
      isPreviewing: false,
    });

    const res = await PATCH(makePatchRequest({ nickname: "a".repeat(61) }));
    expect(res.status).toBe(400);
  });
});
