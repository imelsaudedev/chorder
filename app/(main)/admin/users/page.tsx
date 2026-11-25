export const dynamic = "force-dynamic";

import Main from "@/components/common/Main";
import PageTitleBlock from "@/components/common/PageTitleBlock";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canAccessAdmin } from "@/lib/permissions";
import prisma from "@/prisma/client";
import { getTranslations } from "next-intl/server";
import UsersAdminClient, { type AdminUserRow } from "./UsersAdminClient";

export default async function AdminUsersPage() {
  const [t, live, users] = await Promise.all([
    getTranslations("AdminUsers"),
    getLiveUserAuth(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        roles: true,
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
      roles: u.roles,
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
          currentUserId={live.userId}
          canManageRoles={canAccessAdmin(live.roles)}
        />
      </Main>
    </>
  );
}
