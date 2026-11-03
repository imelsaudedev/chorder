// Corrige títulos em CAIXA ALTA e com espaços sobrando (padrão "frase").
// Por padrão é DRY-RUN: só mostra o que mudaria. Com --apply grava no banco,
// depois de salvar um backup JSON com os títulos antigos.
//   npx tsx prisma/hygiene/fix-titles.ts            # simulação
//   npx tsx prisma/hygiene/fix-titles.ts --apply    # grava
// O slug NÃO muda (já é minúsculo), então links existentes continuam valendo.
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { toSentenceTitle } from "@/lib/hygiene/analyze";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");

async function main() {
  const songs = await prisma.song.findMany({
    where: { isDeleted: false },
    select: { id: true, title: true },
    orderBy: { id: "asc" },
  });
  const changes = songs
    .map((s) => ({ id: s.id, from: s.title, to: toSentenceTitle(s.title) }))
    .filter((c) => c.to !== c.from);

  for (const c of changes) console.log(`#${c.id}  "${c.from}"  →  "${c.to}"`);
  console.log(`\n${changes.length} títulos a alterar de ${songs.length}.`);

  if (!apply) {
    console.log("DRY-RUN: nada foi gravado. Use --apply para gravar.");
    return;
  }

  const backup = `backup-titulos-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(backup, JSON.stringify(changes, null, 2), "utf-8");
  console.log(`Backup dos títulos antigos → ${backup}`);

  await prisma.$transaction(
    changes.map((c) => prisma.song.update({ where: { id: c.id }, data: { title: c.to } })),
  );
  console.log(`✓ ${changes.length} títulos atualizados.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
