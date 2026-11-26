import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { retrieveService } from "@/prisma/data";
import { Metadata } from "next";
import ClientPage from "./ClientPage";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ service: string }>;
  searchParams: Promise<{ share?: string }>;
}): Promise<Metadata> {
  const [{ service: serviceSlug }, { share }, live] = await Promise.all([
    params,
    searchParams,
    getLiveUserAuth(),
  ]);
  const service = await retrieveService(serviceSlug, {
    userId: live.userId,
    roles: live.roles,
    shareToken: share ?? null,
  });
  return { title: service?.title ?? "Liturgia" };
}

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ service: string }>;
  searchParams: Promise<{ share?: string }>;
}) {
  const [{ service: serviceSlug }, { share }, live] = await Promise.all([
    params,
    searchParams,
    getLiveUserAuth(),
  ]);

  const service = await retrieveService(serviceSlug, {
    userId: live.userId,
    roles: live.roles,
    shareToken: share ?? null,
  });

  if (!service) {
    // Link inválido, desativado ou liturgia sem acesso: diz o que aconteceu e, para visitante, oferece Entrar.
    const path = `/services/${serviceSlug}${share ? `?share=${encodeURIComponent(share)}` : ""}`;
    return <AccessDeniedView variant="link" signInCallbackUrl={live.authenticated ? undefined : path} />;
  }

  return <ClientPage serviceSlug={serviceSlug} shareToken={share ?? null} />;
}
