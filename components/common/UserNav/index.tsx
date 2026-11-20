import { auth } from "@/auth";
import UserNavView from "./UserNavView";

export default async function UserNav() {
  const session = await auth();
  if (!session?.user) return null;

  return <UserNavView user={session.user} />;
}
