import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canAccessAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    redirect("/login?callbackUrl=%2Fadmin%2Fusers");
  }
  if (!canAccessAdmin(live.roles)) {
    return <AccessDeniedView />;
  }
  return <>{children}</>;
}
