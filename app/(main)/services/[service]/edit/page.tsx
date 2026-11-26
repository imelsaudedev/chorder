import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { retrieveService } from "@/prisma/data";
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

  const service = await retrieveService(serviceSlug, live.userId);
  if (!service) {
    return <AccessDeniedView />;
  }

  return <ClientServiceFormPage serviceSlug={serviceSlug} />;
}
