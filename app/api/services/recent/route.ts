import { requireChurchServiceViewer } from "@/lib/auth-guard";
import { retrieveRecentServices } from "@/prisma/data";

export async function GET() {
  const guard = await requireChurchServiceViewer();
  if (!guard.ok) return guard.response;

  const services = await retrieveRecentServices();
  return Response.json(services);
}
