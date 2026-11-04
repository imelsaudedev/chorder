// Marca com a tag "Revisão › Blocos sem tipo" as músicas que têm arranjo com blocos sem tipo
// (BLOCK) ou sem nenhum verso/refrão, para filtrar no catálogo e corrigir no editor.
// É um SINCRONIZADOR: adiciona a tag a quem se qualifica e REMOVE de quem já foi resolvido,
// então pode ser rodado de novo depois de classificar. Mexe somente nessa tag.
// Por padrão é DRY-RUN.
//   npx tsx prisma/hygiene/tag-untyped.ts            # simulação
//   npx tsx prisma/hygiene/tag-untyped.ts --apply    # cria a tag (se preciso) e sincroniza
//   npx tsx prisma/hygiene/tag-untyped.ts --remove   # (simulação) desfaz tudo; use com --apply
import { PrismaClient } from "@prisma/client";
import { findUntyped, type HSong } from "@/lib/hygiene/analyze";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");
const remove = process.argv.includes("--remove");
const GROUP = "Revisão";
const TAG = "Blocos sem tipo";

async function main() {
  const rows = await prisma.song.findMany({
    where: { isDeleted: false },
    select: {
      id: true, title: true, slug: true, artist: true, isDeleted: true,
      tags: { select: { id: true, name: true, group: { select: { name: true } } } },
      arrangements: {
        where: { isServiceArrangement: false, isDeleted: false },
        select: {
          id: true, name: true, isDeleted: true, isServiceArrangement: true, originalArrangementId: true,
          units: { select: { id: true, type: true, content: true, order: true }, orderBy: { order: "asc" } },
        },
      },
    },
    orderBy: { title: "asc" },
  });
  const songs: HSong[] = rows.map((s) => ({ ...s, arrangements: s.arrangements.map((a) => ({ ...a, hasServiceUnit: false })) }));

  const wanted = remove ? new Set<number>() : new Set(findUntyped(songs).map((f) => f.songId));
  const has = new Set(rows.filter((s) => s.tags.some((t) => t.name === TAG && t.group.name === GROUP)).map((s) => s.id));
  const toAdd = [...wanted].filter((id) => !has.has(id));
  const toRemove = [...has].filter((id) => !wanted.has(id));
  const title = new Map(rows.map((s) => [s.id, s.title]));

  console.log(`Músicas que devem ter a tag: ${wanted.size} | já têm: ${has.size}`);
  console.log(`+ adicionar a ${toAdd.length}${toAdd.length ? ": " + toAdd.slice(0, 8).map((i) => title.get(i)).join("; ") + (toAdd.length > 8 ? "; …" : "") : ""}`);
  console.log(`- remover de ${toRemove.length}${toRemove.length ? ": " + toRemove.slice(0, 8).map((i) => title.get(i)).join("; ") : ""}`);
  if (!apply) { console.log("DRY-RUN: nada foi gravado. Use --apply para gravar."); return; }

  const last = await prisma.tagGroup.aggregate({ _max: { order: true } });
  const group = await prisma.tagGroup.upsert({
    where: { name: GROUP },
    update: {},
    create: { name: GROUP, color: "#dc2626", order: (last._max.order ?? 0) + 1 },
  });
  const tag = await prisma.tag.upsert({
    where: { name_tagGroupId: { name: TAG, tagGroupId: group.id } },
    update: {},
    create: { name: TAG, tagGroupId: group.id },
  });

  await prisma.$transaction([
    ...toAdd.map((id) => prisma.song.update({ where: { id }, data: { tags: { connect: { id: tag.id } } } })),
    ...toRemove.map((id) => prisma.song.update({ where: { id }, data: { tags: { disconnect: { id: tag.id } } } })),
  ]);
  if (remove) {
    await prisma.tag.delete({ where: { id: tag.id } });
    const left = await prisma.tag.count({ where: { tagGroupId: group.id } });
    if (left === 0) await prisma.tagGroup.delete({ where: { id: group.id } });
    console.log("✓ tag removida" + (left === 0 ? " (e o grupo, que ficou vazio)." : "."));
    return;
  }
  console.log(`✓ tag "${GROUP} › ${TAG}": +${toAdd.length}, -${toRemove.length}.`);
}

main().catch((e) => { console.error("ERRO:", e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
