import { createOrUpdateService, retrieveServices } from "@/prisma/data";
import { serviceSchema } from "@/schemas/service";

export async function GET() {
  const services = await retrieveServices();
  return Response.json(services);
}

export async function POST(request: Request) {
  const body = await request.json();
  const service = serviceSchema.parse({
    sermonTheme: null,
    sermonReference: null,
    preacher: null,
    plan: null,
    ...body,
  });

  const hasContent =
    (service.plan?.sections?.length ?? 0) > 0 || (service.units?.length ?? 0) > 0;
  if (!hasContent) {
    return new Response("Service must have at least one section or unit", { status: 400 });
  }

  const createdService = await createOrUpdateService(service);
  return new Response(JSON.stringify(createdService), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
