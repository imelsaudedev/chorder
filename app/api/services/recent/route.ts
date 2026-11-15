import { retrieveRecentServices } from "@/prisma/data";

export async function GET() {
  const services = await retrieveRecentServices();
  return Response.json(services);
}
