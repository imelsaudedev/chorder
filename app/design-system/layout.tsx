import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canAccessAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";

/** Catálogo interno de componentes: só Admin. */
export default async function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) redirect("/login?callbackUrl=%2Fdesign-system");
  if (!canAccessAdmin(live.roles)) return <AccessDeniedView />;
  return <>{children}</>;
}
