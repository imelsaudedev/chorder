import {
  requireChurchServiceEditor,
  requireChurchServiceManager,
  requireChurchServiceViewer,
} from "@/lib/auth-guard";
import { canManageChurchServices } from "@/lib/permissions";
import {
  createOrUpdateService,
  deleteService,
  retrieveService,
  ServiceConflictError,
} from "@/prisma/data";
import { serviceSchema } from "@/schemas/service";
import type { ServiceStatus } from "@prisma/client";
import { NextRequest } from "next/server";

// Resposta 400 estruturada quando o corpo não passa na validação; o cliente
// traduz os problemas para uma mensagem amigável (lib/friendly-save-error).
function invalidServiceResponse(error: import("zod").ZodError) {
  const issues = error.issues.map(({ path, message }) => ({ path, message }));
  return Response.json({ error: "invalid", issues }, { status: 400 });
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ slugOrId: string; arrangementId: string | "default" }>;
  }
) {
  const guard = await requireChurchServiceViewer();
  if (!guard.ok) return guard.response;

  const { slugOrId } = await params;
  const service = await retrieveService(slugOrId, guard.userId);
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
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const guard = await requireChurchServiceManager();
  if (!guard.ok) return guard.response;

  const { slugOrId } = await params;
  const success = await deleteService(slugOrId, guard.userId);
  if (!success) {
    return new Response("Service not found", { status: 404 });
  }
  return new Response(null, { status: 204 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const guard = await requireChurchServiceEditor();
  if (!guard.ok) return guard.response;

  const { slugOrId } = await params;
  const body = await request.json();

  const service = await retrieveService(slugOrId, guard.userId);
  if (!service) return new Response("Service not found", { status: 404 });

  const data: {
    title?: string | null;
    worshipLeader?: string | null;
    date?: Date;
    preacher?: string | null;
    sermonTheme?: string | null;
    sermonReference?: string | null;
    status?: ServiceStatus;
  } = {};
  if ("title" in body) data.title = body.title ?? null;
  if ("worshipLeader" in body) data.worshipLeader = body.worshipLeader || null;
  if ("date" in body) data.date = new Date(body.date);
  if ("preacher" in body) data.preacher = body.preacher ?? null;
  if ("sermonTheme" in body) data.sermonTheme = body.sermonTheme ?? null;
  if ("sermonReference" in body) data.sermonReference = body.sermonReference ?? null;
  if ("status" in body) {
    if (body.status !== "DRAFT" && body.status !== "PUBLISHED") {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }
    if (!canManageChurchServices(guard.roles)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (service.status === "PUBLISHED" && body.status === "DRAFT") {
      return Response.json(
        { error: "Cannot revert a published service to draft" },
        { status: 400 }
      );
    }
    data.status = body.status;
  }

  await import("@/prisma/client").then(({ default: prisma }) =>
    prisma.service.update({ where: { id: service.id }, data })
  );

  return Response.json({ success: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const guard = await requireChurchServiceEditor();
  if (!guard.ok) return guard.response;

  const { slugOrId } = await params;
  const existing = await retrieveService(slugOrId, guard.userId);
  if (!existing || !existing.id) {
    return new Response("Service not found", { status: 404 });
  }

  const parsed = serviceSchema.safeParse(await request.json());
  if (!parsed.success) return invalidServiceResponse(parsed.error);
  const service = parsed.data;
  if (service.id !== existing.id || (service.slug && service.slug !== existing.slug)) {
    return new Response(
      `Service ID or slug mismatch for ${slugOrId}`,
      { status: 400 }
    );
  }
  const hasContent =
    (service.plan?.sections?.length ?? 0) > 0 || (service.units?.length ?? 0) > 0;
  if (!service?.id || !hasContent) {
    return new Response("Invalid service data", { status: 400 });
  }
  if (service.status && service.status !== existing.status) {
    if (!canManageChurchServices(guard.roles)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (existing.status === "PUBLISHED" && service.status === "DRAFT") {
      return Response.json(
        { error: "Cannot revert a published service to draft" },
        { status: 400 }
      );
    }
  }

  try {
    const updatedService = await createOrUpdateService(
      { ...service, id: existing.id, slug: existing.slug },
      { mode: "update", actorUserId: guard.userId }
    );
    return new Response(JSON.stringify(updatedService), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof ServiceConflictError) {
      return new Response(
        "Este culto foi atualizado por outra pessoa enquanto você editava. Recarregue a página antes de salvar novamente.",
        { status: 409 }
      );
    }
    throw err;
  }
}
