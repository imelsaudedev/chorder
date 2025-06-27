import { retrieveService } from "@/prisma/data";

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
