// Remove blocos (SongUnit) com content === "" (string vazia exata).
// O schema (songUnitSchema: content.min(1)) rejeita esses blocos, então qualquer arranjo ou
// liturgia que os contenha falha ao salvar. Blocos com " " (criados pelo editor) NÃO são tocados.
// Por padrão é DRY-RUN. Com --apply salva backup JSON (linhas completas) e apaga numa transação.
//   npx tsx prisma/hygiene/fix-empty-blocks.ts           # simulação
//   npx tsx prisma/hygiene/fix-empty-blocks.ts --apply   # grava
// Não renumera 'order': lacunas não afetam a ordenação.
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const units = await prisma.songUnit.findMany({
    where: { content: "" },
    select: {
      id: true, arrangementId: true, content: true, type: true, order: true, notes: true, repeatCount: true,
      arrangement: {
        select: {
          isServiceArrangement: true, isDeleted: true,
          song: { select: { title: true, isDeleted: true } },
          serviceUnit: { select: { service: { select: { title: true, date: true, isDeleted: true } } } },
        },
      },
    },
    orderBy: [{ arrangementId: "asc" }, { order: "asc" }],
  });

  // Segurança: nada com conteúdo ou notas deve ser apagado.
  const withNotes = units.filter((u) => u.notes && u.notes.trim() !== "");
  if (withNotes.length) throw new Error(`${withNotes.length} bloco(s) vazio(s) têm notas — revisar manualmente: ${withNotes.map((u) => u.id).join(",")}`);

  const byArr = new Map<number, typeof units>();
  for (const u of units) byArr.set(u.arrangementId, [...(byArr.get(u.arrangementId) ?? []), u]);

  const label = (u: (typeof units)[number]) => {
    const a = u.arrangement;
    if (a.isServiceArrangement) {
      const s = a.serviceUnit?.service;
      return `CULTO ${s ? `${s.date.toISOString().slice(0, 10)} ${s.title ?? ""}`.trim() : "(sem culto)"} — ${a.song.title}`;
    }
    return `MÚSICA ${a.song.title}${a.song.isDeleted ? " (excluída)" : ""}${a.isDeleted ? " [arranjo excluído]" : ""}`;
  };
  for (const [arrId, list] of byArr) console.log(`arranjo ${arrId}: ${list.length} bloco(s) vazio(s) (ordens ${list.map((u) => u.order).join(",")}) — ${label(list[0])}`);

  // Arranjos que ficariam sem nenhum bloco depois da remoção.
  const totals = await prisma.songUnit.groupBy({ by: ["arrangementId"], where: { arrangementId: { in: [...byArr.keys()] } }, _count: { _all: true } });
  const emptied = totals.filter((t) => t._count._all === byArr.get(t.arrangementId)!.length);
  if (emptied.length) {
    console.log(`\n⚠ ${emptied.length} arranjo(s) ficariam SEM NENHUM bloco:`);
    for (const t of emptied) {
      const u = byArr.get(t.arrangementId)![0];
      console.log(`  arranjo ${t.arrangementId} — ${label(u)}`);
    }
  }

  const inLiturgy = units.filter((u) => u.arrangement.isServiceArrangement).length;
  console.log(`\n${units.length} blocos vazios em ${byArr.size} arranjos (${inLiturgy} em cópias de culto, ${units.length - inLiturgy} em arranjos de música).`);
  if (!apply) { console.log("DRY-RUN: nada foi gravado. Use --apply para gravar."); return; }

  const name = `backup-blocos-vazios-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(
    name,
    JSON.stringify(units.map(({ arrangement: _a, ...u }) => u), null, 2),
    "utf-8",
  );
  console.log(`Backup dos blocos apagados → ${name}`);
  const res = await prisma.songUnit.deleteMany({ where: { id: { in: units.map((u) => u.id) }, content: "" } });
  console.log(`✓ ${res.count} blocos vazios removidos.`);
}

main().catch((e) => { console.error("ERRO:", e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
