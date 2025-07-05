import { retrieveService } from "@/prisma/data";
import ClientServiceFormPage from "../../ClientServiceFormPage";

export default async function EditServicePage({
  params,
}: {
  params: { service: string };
}) {
  const { service: serviceSlug } = await params;

  const service = await retrieveService(serviceSlug);

  if (!service) {
    throw new Error(`Service with slug "${serviceSlug}" not found.`);
  }

  return <ClientServiceFormPage service={service} />;
}
