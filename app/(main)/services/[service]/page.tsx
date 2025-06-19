import ServiceViewer from "./ServiceViewer";
import ServiceViewContext from "./ServiceViewer/ServiceViewContext";

export const dynamic = "force-dynamic";

export default async function ServicePage({
  params,
}: {
  params: { service: string };
}) {
  const { service: serviceSlug } = await params;

  return (
    <ServiceViewContext serviceSlug={serviceSlug}>
      <ServiceViewer />
    </ServiceViewContext>
  );
}
