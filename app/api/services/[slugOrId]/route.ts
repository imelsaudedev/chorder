import { deleteService, retrieveService } from "@/prisma/data";

export async function GET(
  request: Request,
  {
    params,
  }: { params: { slugOrId: string; arrangementId: string | "default" } }
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
  { params }: { params: { slugOrId: string } }
) {
  const { slugOrId } = await params;
  const success = await deleteService(slugOrId);
  if (!success) {
    return new Response("Failed to delete arrangement", { status: 500 });
  }
  return new Response(null, { status: 204 });
}
