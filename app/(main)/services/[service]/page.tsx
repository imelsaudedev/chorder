import ClientPage from "./ClientPage";

export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: serviceSlug } = await params;

  return <ClientPage serviceSlug={serviceSlug} />;
}
