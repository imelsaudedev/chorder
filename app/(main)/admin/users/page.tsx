export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import Main from "@/components/common/Main";
import PageTitleBlock from "@/components/common/PageTitleBlock";
import prisma from "@/prisma/client";
import { getTranslations } from "next-intl/server";
import UsersAdminClient, { type AdminUserRow } from "./UsersAdminClient";

export default async function AdminUsersPage() {
  const [t, session, users] = await Promise.all([
    getTranslations("AdminUsers"),
    auth(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    }),
  ]);

  const currentUserId = session?.user?.id ?? null;
  const currentDbUser = currentUserId
    ? users.find((u) => u.id === currentUserId)
    : null;
  const canManageRoles = currentDbUser?.role === "ADMIN";

  const mappedUsers: AdminUserRow[] = users.map((u) => {
    const providers = Array.from(new Set(u.accounts.map((a) => a.provider)));
    if (providers.length === 0 && u.emailVerified) {
      providers.push("resend");
    }
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      providers,
      createdAt: u.createdAt.toISOString(),
    };
  });

  return (
    <>
      <PageTitleBlock title={t("title")} />
      <Main>
        <UsersAdminClient
          users={mappedUsers}
          currentUserId={currentUserId}
          canManageRoles={canManageRoles}
        />
      </Main>
    </>
  );
}
