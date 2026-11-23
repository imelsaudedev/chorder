import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canViewChurchServices } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    redirect("/login?callbackUrl=%2Fservices");
  }
  if (!canViewChurchServices(live.roles)) {
    return <AccessDeniedView />;
  }
  return <>{children}</>;
}
