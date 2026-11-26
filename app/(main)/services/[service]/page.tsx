import { getLiveUserAuth } from "@/lib/auth-guard";
import { retrieveService } from "@/prisma/data";
import { Metadata } from "next";
import ClientPage from "./ClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const [{ service: serviceSlug }, live] = await Promise.all([
    params,
    getLiveUserAuth(),
  ]);
  const service = await retrieveService(serviceSlug, live.userId);
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
