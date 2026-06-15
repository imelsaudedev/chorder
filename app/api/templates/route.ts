import { createOrUpdateTemplate, retrieveTemplates } from "@/prisma/data";

export async function GET() {
  const templates = await retrieveTemplates();
  return Response.json(templates);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.name || !body?.items) {
    return new Response("Invalid template data", { status: 400 });
  }
  const template = await createOrUpdateTemplate({ name: body.name, items: body.items });
  return Response.json(template, { status: 201 });
}
