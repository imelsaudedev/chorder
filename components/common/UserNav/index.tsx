import { auth } from "@/auth";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canAccessAdmin } from "@/lib/permissions";
import { getDisplayName } from "@/lib/user-display";
import prisma from "@/prisma/client";
import UserNavView from "./UserNavView";

export default async function UserNav() {
  const [session, live] = await Promise.all([auth(), getLiveUserAuth()]);
  if (!session?.user) return null;

  const dbUser = live.authenticated
    ? await prisma.user.findUnique({
        where: { id: live.userId },
        select: { name: true, nickname: true, email: true, image: true },
      })
    : null;

  const name = dbUser ? getDisplayName(dbUser) : session.user.name;
  const email = dbUser?.email ?? session.user.email;
  const image = dbUser?.image ?? session.user.image;
  const isRealAdmin = live.authenticated && canAccessAdmin(live.realRoles);

  return (
    <UserNavView
      user={{ name, email, image }}
      isRealAdmin={isRealAdmin}
      activeRoles={live.roles}
      isPreviewing={live.isPreviewing}
    />
  );
}
