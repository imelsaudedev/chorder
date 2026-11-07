import { auth, signOut } from "@/auth";
import UserNavView from "./UserNavView";

export default async function UserNav() {
  const session = await auth();
  if (!session?.user) return null;

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return <UserNavView user={session.user} onSignOut={handleSignOut} />;
}
