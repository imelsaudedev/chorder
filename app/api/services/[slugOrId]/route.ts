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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const { slugOrId } = await params;
  const body = await request.json();

  const service = await retrieveService(slugOrId);
  if (!service) return new Response("Service not found", { status: 404 });

  const data: {
    title?: string | null;
    worshipLeader?: string | null;
    date?: Date;
    preacher?: string | null;
    sermonTheme?: string | null;
    sermonReference?: string | null;
  } = {};
  if ("title" in body) data.title = body.title ?? null;
  if ("worshipLeader" in body) data.worshipLeader = body.worshipLeader || null;
  if ("date" in body) data.date = new Date(body.date);
  if ("preacher" in body) data.preacher = body.preacher ?? null;
  if ("sermonTheme" in body) data.sermonTheme = body.sermonTheme ?? null;
  if ("sermonReference" in body) data.sermonReference = body.sermonReference ?? null;

  await import("@/prisma/client").then(({ default: prisma }) =>
    prisma.service.update({ where: { id: service.id }, data })
  );

  return Response.json({ success: true });
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
  const hasContent =
    (service.plan?.sections?.length ?? 0) > 0 || (service.units?.length ?? 0) > 0;
  if (!service?.id || !hasContent) {
    return new Response("Invalid service data", { status: 400 });
  }

  const updatedService = await createOrUpdateService(service);

  return new Response(JSON.stringify(updatedService), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
