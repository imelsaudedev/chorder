import ClientPage from "./ClientPage";

export default async function ServicePage({
  params,
}: {
  params: { service: string };
}) {
  const { service: serviceSlug } = await params;

  return <ClientPage serviceSlug={serviceSlug} />;
}
