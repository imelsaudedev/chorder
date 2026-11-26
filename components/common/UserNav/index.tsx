import { auth } from "@/auth";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canAccessAdmin } from "@/lib/permissions";
import UserNavView from "./UserNavView";

export default async function UserNav() {
  const [session, live] = await Promise.all([auth(), getLiveUserAuth()]);
  if (!session?.user) return null;

  const { name, email, image } = session.user;
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
