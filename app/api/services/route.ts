import { createOrUpdateService, retrieveServices } from "@/prisma/data";
import { serviceSchema } from "@/schemas/service";

export async function GET() {
  const services = await retrieveServices();
  return Response.json(services);
}

export async function POST(request: Request) {
  const service = serviceSchema.parse(await request.json());

  if (!service || !service.units?.length) {
    return new Response(
      `Invalid service data ${JSON.stringify(service, null, 2)}`,
      { status: 400 }
    );
  }

  const createdService = await createOrUpdateService(service);
  return new Response(JSON.stringify(createdService), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
