import { retrieveService } from "@/prisma/data";
import ClientServiceEditPage from "./ClientServiceEditPage";

export default async function EditServicePage({
  params,
}: {
  params: { service: string };
}) {
  const { service: serviceSlug } = await params;

  const service = await retrieveService(serviceSlug);

  if (!service) {
    return null;
  }

  return <ClientServiceEditPage service={service} />;
}
