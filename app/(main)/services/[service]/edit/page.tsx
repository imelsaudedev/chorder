import ClientServiceFormPage from "../../ClientServiceFormPage";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: serviceSlug } = await params;

  return <ClientServiceFormPage serviceSlug={serviceSlug} />;
}
