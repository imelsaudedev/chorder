import { retrieveService } from "@/prisma/data";
import { Metadata } from "next";
import ClientPage from "./ClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const service = await retrieveService(serviceSlug);
  return { title: service?.title ?? "Liturgia" };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: serviceSlug } = await params;

  return <ClientPage serviceSlug={serviceSlug} />;
}
