import { GET } from "@/app/api/notifications/route";
import { POST as markReadPOST } from "@/app/api/notifications/read/route";
import {
  getUnseenNewUserIdsForAdmin,
  notifyAdminsOfNewUser,
} from "@/lib/notifications";
import prisma from "@/prisma/client";
import { NextRequest } from "next/server";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetLiveUserAuth } = vi.hoisted(() => ({
  mockGetLiveUserAuth: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({
  getLiveUserAuth: mockGetLiveUserAuth,
}));

function makeReadRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/notifications/read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Notifications service and API integration", () => {
  const adminEmail = "notif-admin-test@example.com";
  const newUser1Email = "notif-new1-test@example.com";
  const newUser2Email = "notif-new2-test@example.com";
  const allEmails = [adminEmail, newUser1Email, newUser2Email];

  let adminId: string;
  let newUser1Id: string;
  let newUser2Id: string;

  beforeEach(async () => {
    mockGetLiveUserAuth.mockReset();
    await prisma.user.deleteMany({ where: { email: { in: allEmails } } });

    const admin = await prisma.user.create({
      data: { email: adminEmail, name: "Admin Test", roles: ["ADMIN"] },
    });
    adminId = admin.id;

    const u1 = await prisma.user.create({
      data: { email: newUser1Email, name: null, roles: [] },
    });
    newUser1Id = u1.id;

    const u2 = await prisma.user.create({
      data: { email: newUser2Email, name: "Ana Souza", roles: [] },
    });
    newUser2Id = u2.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: allEmails } } });
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: false,
      userId: null,
      roles: [],
      realRoles: [],
      isPreviewing: false,
    });

    const getRes = await GET();
    expect(getRes.status).toBe(401);

    const postRes = await markReadPOST(makeReadRequest({ all: true }));
    expect(postRes.status).toBe(401);
  });

  it("unifies multiple unread NEW_USER_REGISTERED notifications and reflects live user names", async () => {
    await notifyAdminsOfNewUser({
      id: newUser1Id,
      name: null,
      email: newUser1Email,
    });
    await notifyAdminsOfNewUser({
      id: newUser2Id,
      name: "Ana Souza",
      email: newUser2Email,
    });

    // User 1 later sets their name on /profile
    await prisma.user.update({
      where: { id: newUser1Id },
      data: { name: "Carlos Lima" },
    });

    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: true,
      userId: adminId,
      roles: ["ADMIN"],
      realRoles: ["ADMIN"],
      isPreviewing: false,
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.unreadCount).toBe(1);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].type).toBe("NEW_USER_REGISTERED");
    expect(data.items[0].unread).toBe(true);
    expect(data.items[0].href).toBe("/admin/users?filter=unseen");
    expect(data.items[0].ids).toHaveLength(2);
    expect(data.items[0].users).toHaveLength(2);

    const names = data.items[0].users.map((u: { name: string | null }) => u.name);
    expect(names).toContain("Carlos Lima");
    expect(names).toContain("Ana Souza");

    const unseenIds = await getUnseenNewUserIdsForAdmin(adminId);
    expect(unseenIds.sort()).toEqual([newUser1Id, newUser2Id].sort());
  });

  it("marks notifications read by entityIds and by type", async () => {
    await notifyAdminsOfNewUser({
      id: newUser1Id,
      name: null,
      email: newUser1Email,
    });
    await notifyAdminsOfNewUser({
      id: newUser2Id,
      name: "Ana Souza",
      email: newUser2Email,
    });

    mockGetLiveUserAuth.mockResolvedValue({
      authenticated: true,
      userId: adminId,
      roles: ["ADMIN"],
      realRoles: ["ADMIN"],
      isPreviewing: false,
    });

    // Mark just user 1 as seen
    const partialRes = await markReadPOST(
      makeReadRequest({
        type: "NEW_USER_REGISTERED",
        entityIds: [newUser1Id],
      })
    );
    expect(partialRes.status).toBe(200);
    expect(await getUnseenNewUserIdsForAdmin(adminId)).toEqual([newUser2Id]);

    // Mark remaining NEW_USER_REGISTERED as seen
    const restRes = await markReadPOST(
      makeReadRequest({ type: "NEW_USER_REGISTERED" })
    );
    expect(restRes.status).toBe(200);
    expect(await getUnseenNewUserIdsForAdmin(adminId)).toEqual([]);

    const getRes = await GET();
    const data = await getRes.json();
    expect(data.unreadCount).toBe(0);
  });
});
