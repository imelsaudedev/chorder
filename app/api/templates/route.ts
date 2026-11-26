import { requireAdmin, requireChurchServiceManager } from "@/lib/auth-guard";
import { createOrUpdateTemplate, retrieveTemplates } from "@/prisma/data";

export async function GET() {
  const guard = await requireChurchServiceManager();
  if (!guard.ok) return guard.response;

  const templates = await retrieveTemplates();
  return Response.json(templates);
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await request.json();
  if (!body?.name || !body?.items) {
    return new Response("Invalid template data", { status: 400 });
  }
  const template = await createOrUpdateTemplate({ name: body.name, items: body.items });
  return Response.json(template, { status: 201 });
}
