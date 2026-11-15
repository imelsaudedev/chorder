import { createOrUpdateService, retrieveServices, ServiceConflictError } from "@/prisma/data";
import { serviceSchema } from "@/schemas/service";

// Resposta 400 estruturada quando o corpo não passa na validação; o cliente
// traduz os problemas para uma mensagem amigável (lib/friendly-save-error).
function invalidServiceResponse(error: import("zod").ZodError) {
  const issues = error.issues.map(({ path, message }) => ({ path, message }));
  return Response.json({ error: "invalid", issues }, { status: 400 });
}

export async function GET() {
  const services = await retrieveServices();
  return Response.json(services);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = serviceSchema.safeParse({
    sermonTheme: null,
    sermonReference: null,
    preacher: null,
    plan: null,
    ...body,
  });
  if (!parsed.success) return invalidServiceResponse(parsed.error);
  const service = parsed.data;

  const hasContent =
    (service.plan?.sections?.length ?? 0) > 0 || (service.units?.length ?? 0) > 0;
  if (!hasContent) {
    return new Response("Service must have at least one section or unit", { status: 400 });
  }

  try {
    const createdService = await createOrUpdateService(service);
    return new Response(JSON.stringify(createdService), {
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
