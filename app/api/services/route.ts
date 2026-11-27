import { getLiveUserAuth } from "@/lib/auth-guard";
import {
  canManageChurchServices,
  canViewChurchServices,
} from "@/lib/permissions";
import {
  createOrUpdateService,
  retrieveServices,
  retrieveServicesList,
  ServiceConflictError,
  ServiceSlugExistsError,
} from "@/prisma/data";
import { serviceSchema } from "@/schemas/service";
import type { ServiceScope } from "@prisma/client";
import { NextResponse } from "next/server";

// Resposta 400 estruturada quando o corpo não passa na validação; o cliente
// traduz os problemas para uma mensagem amigável (lib/friendly-save-error).
function invalidServiceResponse(error: import("zod").ZodError) {
  const issues = error.issues.map(({ path, message }) => ({ path, message }));
  return Response.json({ error: "invalid", issues }, { status: 400 });
}

// `?view=list` devolve o resumo leve da lista de Liturgias (sem o plano).
// `?scope=personal` devolve as liturgias pessoais do usuário (próprias e compartilhadas).
export async function GET(request: Request) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const scopeParam = url.searchParams.get("scope");
  const scope: ServiceScope =
    scopeParam === "personal" ? "PERSONAL" : "CHURCH";

  if (scope === "CHURCH" && !canViewChurchServices(live.roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (url.searchParams.get("view") === "list") {
    return Response.json(await retrieveServicesList(live.userId, scope));
  }
  const services = await retrieveServices(live.userId, scope);
  return Response.json(services);
}

export async function POST(request: Request) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = serviceSchema.safeParse({
    leaders: [],
    plan: null,
    ...body,
  });
  if (!parsed.success) return invalidServiceResponse(parsed.error);
  const service = parsed.data;

  const targetScope: ServiceScope = service.scope ?? "CHURCH";
  if (targetScope === "CHURCH" && !canManageChurchServices(live.roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const hasContent =
    (service.plan?.sections?.length ?? 0) > 0 || (service.units?.length ?? 0) > 0;
  if (!hasContent) {
    return new Response("Service must have at least one section or unit", { status: 400 });
  }

  try {
    const createdService = await createOrUpdateService(
      { ...service, scope: targetScope },
      { mode: "create", actorUserId: live.userId, actorRoles: live.roles }
    );
    return new Response(JSON.stringify(createdService), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof ServiceSlugExistsError) {
      return Response.json({ error: "Service slug already exists" }, { status: 409 });
    }
    if (err instanceof ServiceConflictError) {
      return new Response(
        "Este culto foi atualizado por outra pessoa enquanto você editava. Recarregue a página antes de salvar novamente.",
        { status: 409 }
      );
    }
    throw err;
  }
}
