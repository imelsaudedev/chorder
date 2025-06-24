import { retrieveServices } from "@/prisma/data";

export async function GET() {
  const services = await retrieveServices();
  return Response.json(services);
}
