import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { retrieveService } from "@/prisma/data";
import { redirect } from "next/navigation";
import ClientServiceFormPage from "../../ClientServiceFormPage";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const [{ service: serviceSlug }, live] = await Promise.all([
    params,
    getLiveUserAuth(),
  ]);

  if (!live.authenticated) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/services/${serviceSlug}/edit`)}`);
  }

  const service = await retrieveService(serviceSlug, {
    userId: live.userId,
    roles: live.roles,
  });

  if (!service || !service.canEdit) {
    return <AccessDeniedView />;
  }

  return <ClientServiceFormPage serviceSlug={serviceSlug} />;
}
