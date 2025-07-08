import {
  createOrUpdateService,
  deleteService,
  retrieveService,
} from "@/prisma/data";
import { serviceSchema } from "@/schemas/service";
import { NextRequest } from "next/server";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ slugOrId: string; arrangementId: string | "default" }>;
  }
) {
  const { slugOrId } = await params;
  const service = await retrieveService(slugOrId);
  if (!service) {
    return new Response("Service not found", { status: 404 });
  }
  return new Response(JSON.stringify(service), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const { slugOrId } = await params;
  const success = await deleteService(slugOrId);
  if (!success) {
    return new Response("Failed to delete arrangement", { status: 500 });
  }
  return new Response(null, { status: 204 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const { slugOrId } = await params;
  const service = serviceSchema.parse(await request.json());
  if (service.id !== parseInt(slugOrId) && service.slug !== slugOrId) {
    return new Response(
      `Arrangement ID or slug mismatch. Expected ${
        service.id
      } or ${JSON.stringify(service.slug)} to be equal to ${slugOrId}`,
      { status: 400 }
    );
  }
  if (!service?.id || !service?.units?.length) {
    return new Response("Invalid service data", { status: 400 });
  }

  const updatedService = await createOrUpdateService(service);

  return new Response(JSON.stringify(updatedService), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
