import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Defense-in-depth auth guard for all /admin/* pages at the Server Component layer.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
