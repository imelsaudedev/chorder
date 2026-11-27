import { getLiveUserAuth } from "@/lib/auth-guard";
import { canManageChurchServices } from "@/lib/permissions";
import {
  createOrUpdateService,
  deleteService,
  existingUserId,
  setServiceLeaders,
  retrieveService,
  ServiceConflictError,
} from "@/prisma/data";
import { serviceSchema } from "@/schemas/service";
import type { ServiceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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
  const [live, { slugOrId }] = await Promise.all([getLiveUserAuth(), params]);
  const shareToken = new URL(request.url).searchParams.get("share");

  const service = await retrieveService(slugOrId, {
    userId: live.userId,
    roles: live.roles,
    shareToken,
  });

  if (!service) {
    if (!live.authenticated && !shareToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slugOrId } = await params;
  const existing = await retrieveService(slugOrId, {
    userId: live.userId,
    roles: live.roles,
  });
  if (!existing) {
    return new Response("Service not found", { status: 404 });
  }
  if (!existing.canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const success = await deleteService(slugOrId, {
    userId: live.userId,
    roles: live.roles,
  });
  if (!success) {
    return new Response("Service not found", { status: 404 });
  }
  return new Response(null, { status: 204 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slugOrId } = await params;
  const body = await request.json();

  const service = await retrieveService(slugOrId, {
    userId: live.userId,
    roles: live.roles,
  });
  if (!service || !service.id) {
    return new Response("Service not found", { status: 404 });
  }
  if (!service.canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data: {
    title?: string | null;
    worshipLeader?: string | null;
    date?: Date;
    preacher?: string | null;
    preacherId?: string | null;
    sermonTheme?: string | null;
    sermonReference?: string | null;
    status?: ServiceStatus;
  } = {};
  if ("title" in body) data.title = body.title ?? null;
  if (Array.isArray(body.leaders)) {
    // edição rápida pela lista: a lista de pessoas é a fonte e o texto do dirigente é derivado dela
    const entries = body.leaders.flatMap((item: unknown) => {
      const entry = item as { userId?: unknown; name?: unknown } | null;
      return typeof entry?.name === "string"
        ? [{ userId: typeof entry.userId === "string" ? entry.userId : null, name: entry.name }]
        : [];
    });
    data.worshipLeader = await setServiceLeaders(service.id, entries);
  } else if ("worshipLeader" in body) {
    data.worshipLeader = body.worshipLeader || null;
  }
  if ("date" in body) data.date = new Date(body.date);
  if ("preacher" in body) data.preacher = body.preacher ?? null;
  if ("preacherId" in body) {
    const { default: prisma } = await import("@/prisma/client");
    data.preacherId = await existingUserId(prisma, typeof body.preacherId === "string" ? body.preacherId : null);
  }
  if ("sermonTheme" in body) data.sermonTheme = body.sermonTheme ?? null;
  if ("sermonReference" in body) data.sermonReference = body.sermonReference ?? null;
  if ("status" in body && service.scope !== "PERSONAL") {
    if (body.status !== "DRAFT" && body.status !== "PUBLISHED") {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }
    if (service.status === "PUBLISHED" && body.status === "DRAFT") {
      if (!canManageChurchServices(live.roles)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      return Response.json(
        { error: "Cannot revert a published service to draft" },
        { status: 400 }
      );
    }
    if (service.status === "DRAFT" && body.status === "PUBLISHED" && !service.canPublish) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
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
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slugOrId } = await params;
  const existing = await retrieveService(slugOrId, {
    userId: live.userId,
    roles: live.roles,
  });
  if (!existing || !existing.id) {
    return new Response("Service not found", { status: 404 });
  }
  if (!existing.canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Cliente que ainda não conhece a lista de dirigentes (aba aberta antes da atualização) manda só o texto.
  const parsed = serviceSchema.safeParse({ leaders: [], preacherId: null, ...(await request.json()) });
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
  if (
    existing.scope === "CHURCH" &&
    service.status &&
    service.status !== existing.status
  ) {
    if (existing.status === "PUBLISHED" && service.status === "DRAFT") {
      if (!canManageChurchServices(live.roles)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      return Response.json(
        { error: "Cannot revert a published service to draft" },
        { status: 400 }
      );
    }
    if (existing.status === "DRAFT" && service.status === "PUBLISHED" && !existing.canPublish) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const updatedService = await createOrUpdateService(
      { ...service, id: existing.id, slug: existing.slug },
      { mode: "update", actorUserId: live.userId, actorRoles: live.roles }
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
