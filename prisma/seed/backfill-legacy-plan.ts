// Script único: constrói `Service.plan` para cultos antigos que só têm
// `ServiceUnit` (criados antes do editor de liturgia). Idempotente: só toca
// serviços com plan: null, seguro rodar mais de uma vez.
//
// IMPORTANTE: precisa rodar contra o Neon de produção (DIRECT_URL de prod)
// e confirmar 0 cultos sem plan ANTES de qualquer migration que apague a
// tabela ServiceUnit — ver "O que NÃO foi feito" em docs/arquitetura-plano-culto.md.
//
// Uso: npx tsx prisma/seed/backfill-legacy-plan.ts
import { ServicePlan } from "../models";
import prisma from "../client";

async function backfillLegacyPlan() {
  // Filtra em JS em vez de no `where` pra não depender de Prisma.DbNull vs
  // Prisma.JsonNull em campo Json? — a tabela é pequena, sem custo real.
  const services = await prisma.service.findMany({
    include: { units: { orderBy: { order: "asc" } } },
  });

  const legacyServices = services.filter((s) => s.plan === null);

  console.log(`Encontrados ${legacyServices.length} cultos sem plan.`);

  let updated = 0;
  for (const service of legacyServices) {
    const plan: ServicePlan = {
      startTime: null,
      sections: [
        {
          id: crypto.randomUUID(),
          type: "CULTO",
          label: "Culto",
          order: 1,
          units: service.units.map((unit) => ({
            clientId: crypto.randomUUID(),
            type: unit.type,
            arrangementId: unit.arrangementId,
            semitoneTranspose: unit.semitoneTranspose,
            order: unit.order,
            durationMin: null,
            label: null,
            metadata: null,
          })),
        },
      ],
    };

    await prisma.service.update({
      where: { id: service.id },
      data: { plan: plan as object },
    });
    updated++;
  }

  console.log(`${updated} cultos atualizados com plan construído a partir do ServiceUnit.`);
}

backfillLegacyPlan().then(() => prisma.$disconnect());
