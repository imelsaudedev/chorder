import {
  createOrUpdateTemplate,
  deleteTemplate,
  retrieveTemplate,
} from "@/prisma/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = await retrieveTemplate(parseInt(id));
  if (!template) return new Response("Template not found", { status: 404 });
  return Response.json(template);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  if (!body?.name || !body?.items) {
    return new Response("Invalid template data", { status: 400 });
  }
  const template = await createOrUpdateTemplate({
    id: parseInt(id),
    name: body.name,
    items: body.items,
  });
  return Response.json(template);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteTemplate(parseInt(id));
  return new Response(null, { status: 204 });
}
