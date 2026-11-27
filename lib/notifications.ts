import prisma from "@/prisma/client";
import type { NotificationType } from "@prisma/client";

export type NotificationUserSummary = {
  id: string;
  name: string | null;
  email: string | null;
};

export type NotificationItem = {
  id: string;
  ids: string[];
  type: NotificationType;
  unread: boolean;
  href: string | null;
  createdAt: string;
  users?: NotificationUserSummary[];
};

export type NotificationsResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

type NewUserPayload = {
  registeredUserId?: string;
  name?: string | null;
  email?: string | null;
};

export async function notifyAdminsOfNewUser(registeredUser: {
  id: string;
  name?: string | null;
  email?: string | null;
}): Promise<number> {
  const admins = await prisma.user.findMany({
    where: {
      roles: { has: "ADMIN" },
      id: { not: registeredUser.id },
    },
    select: { id: true },
  });

  if (admins.length === 0) return 0;

  const result = await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "NEW_USER_REGISTERED",
      entityId: registeredUser.id,
      payload: {
        registeredUserId: registeredUser.id,
        name: registeredUser.name ?? null,
        email: registeredUser.email ?? null,
      },
      href: "/admin/users?filter=unseen",
    })),
  });

  return result.count;
}

export async function getNotificationsForUser(
  userId: string
): Promise<NotificationsResponse> {
  const [unreadRows, recentReadRows] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, readAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.notification.findMany({
      where: { userId, readAt: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const allRows = [...unreadRows, ...recentReadRows];
  const entityIds = Array.from(
    new Set(
      allRows
        .filter((r) => r.type === "NEW_USER_REGISTERED" && r.entityId)
        .map((r) => r.entityId as string)
    )
  );

  const liveUsers =
    entityIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: entityIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

  const userMap = new Map(liveUsers.map((u) => [u.id, u]));

  const resolveUserSummary = (
    row: (typeof allRows)[number]
  ): NotificationUserSummary => {
    const liveUser = row.entityId ? userMap.get(row.entityId) : undefined;
    const payload = (row.payload ?? {}) as NewUserPayload;
    return {
      id: row.entityId ?? payload.registeredUserId ?? row.id,
      name: liveUser?.name ?? payload.name ?? null,
      email: liveUser?.email ?? payload.email ?? null,
    };
  };

  const items: NotificationItem[] = [];

  // Unify all unread NEW_USER_REGISTERED notifications into a single item
  const unreadNewUsers = unreadRows.filter(
    (r) => r.type === "NEW_USER_REGISTERED"
  );
  if (unreadNewUsers.length > 0) {
    const seenUserIds = new Set<string>();
    const users: NotificationUserSummary[] = [];
    for (const row of unreadNewUsers) {
      const summary = resolveUserSummary(row);
      if (!seenUserIds.has(summary.id)) {
        seenUserIds.add(summary.id);
        users.push(summary);
      }
    }

    items.push({
      id: `group:NEW_USER_REGISTERED`,
      ids: unreadNewUsers.map((r) => r.id),
      type: "NEW_USER_REGISTERED",
      unread: true,
      href: "/admin/users?filter=unseen",
      createdAt: unreadNewUsers[0].createdAt.toISOString(),
      users,
    });
  }

  // Any other unread notification types (future extensibility)
  for (const row of unreadRows) {
    if (row.type === "NEW_USER_REGISTERED") continue;
    items.push({
      id: row.id,
      ids: [row.id],
      type: row.type,
      unread: true,
      href: row.href,
      createdAt: row.createdAt.toISOString(),
    });
  }

  // Recent read notifications
  for (const row of recentReadRows) {
    items.push({
      id: row.id,
      ids: [row.id],
      type: row.type,
      unread: false,
      href: row.href,
      createdAt: row.createdAt.toISOString(),
      users:
        row.type === "NEW_USER_REGISTERED"
          ? [resolveUserSummary(row)]
          : undefined,
    });
  }

  // Keep unread items first, sorted by newest
  items.sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const unreadCount = items.filter((item) => item.unread).length;

  return { items, unreadCount };
}

export async function getUnseenNewUserIdsForAdmin(
  adminUserId: string
): Promise<string[]> {
  const rows = await prisma.notification.findMany({
    where: {
      userId: adminUserId,
      type: "NEW_USER_REGISTERED",
      readAt: null,
      entityId: { not: null },
    },
    select: { entityId: true },
  });

  return Array.from(
    new Set(rows.map((r) => r.entityId).filter((id): id is string => Boolean(id)))
  );
}

export async function markNotificationsAsRead(
  userId: string,
  options:
    | { all: true }
    | { ids: string[] }
    | { type: NotificationType; entityIds?: string[] }
): Promise<number> {
  const now = new Date();

  if ("all" in options) {
    const res = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: now },
    });
    return res.count;
  }

  if ("ids" in options) {
    const res = await prisma.notification.updateMany({
      where: { userId, id: { in: options.ids }, readAt: null },
      data: { readAt: now },
    });
    return res.count;
  }

  const res = await prisma.notification.updateMany({
    where: {
      userId,
      type: options.type,
      readAt: null,
      ...(options.entityIds && options.entityIds.length > 0
        ? { entityId: { in: options.entityIds } }
        : {}),
    },
    data: { readAt: now },
  });
  return res.count;
}
