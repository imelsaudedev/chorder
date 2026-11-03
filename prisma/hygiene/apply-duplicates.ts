// Aplica as decisões de duplicatas (decisoes.json gerado por review-duplicates.ts).
// Por padrão é DRY-RUN. Com --apply grava, depois de salvar um backup JSON do estado anterior.
//   npx tsx prisma/hygiene/apply-duplicates.ts [decisoes.json]            # simulação
//   npx tsx prisma/hygiene/apply-duplicates.ts [decisoes.json] --apply    # grava
//
// Nada é apagado: músicas e arranjos descartados recebem isDeleted = true.
//  - "manter": as músicas removidas e seus arranjos ficam excluídos.
//  - "mesclar": arranjos marcados são MOVIDOS (mesmo id, então cultos e links continuam valendo)
//    para a música destino, com o nome escolhido e isDefault = false; os demais ficam excluídos.
//  - Tags das músicas removidas são somadas às da música que fica.
//  - Cópias de culto (isServiceArrangement) das músicas removidas passam a apontar para a que fica.
import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "fs";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");
const file = process.argv.slice(2).find((a) => !a.startsWith("--")) ?? "decisoes.json";

type Decision =
  | { grupo: number; decisao: "pendente" | "nao_duplicata" }
  | { grupo: number; decisao: "manter"; manter: number; remover: number[] }
  | {
      grupo: number; decisao: "mesclar"; destino: number;
      mover: { arranjo: number; deMusica: number; nome: string | null }[];
      descartarArranjos: number[]; removerMusicas: number[];
    };

type Plan = {
  grupo: number; keep: number; removeSongs: number[];
  move: { arrangementId: number; name: string | null }[];
  discardArrangements: number[];
};

async function main() {
  const decisions: Decision[] = JSON.parse(readFileSync(file, "utf-8"));
  if (decisions.some((d) => d.decisao === "pendente")) throw new Error("Há grupos pendentes em " + file);

  const songs = await prisma.song.findMany({
    select: {
      id: true, title: true, isDeleted: true, tags: { select: { id: true, name: true } },
      arrangements: { select: { id: true, name: true, isDefault: true, isDeleted: true, isServiceArrangement: true } },
    },
  });
  const byId = new Map(songs.map((s) => [s.id, s]));
  const arrOwner = new Map(songs.flatMap((s) => s.arrangements.map((a) => [a.id, s.id] as const)));

  // ---- plano + validação
  const plans: Plan[] = [];
  const seenSongs = new Set<number>();
  const fail = (m: string): never => { throw new Error(m); };
  for (const d of decisions) {
    if (d.decisao !== "manter" && d.decisao !== "mesclar") continue;
    const keep = d.decisao === "manter" ? d.manter : d.destino;
    const remove = d.decisao === "manter" ? d.remover : d.removerMusicas;
    for (const id of [keep, ...remove]) {
      const s = byId.get(id) ?? fail(`Grupo ${d.grupo}: música #${id} não existe`);
      if (s.isDeleted) fail(`Grupo ${d.grupo}: música #${id} já está excluída (decisões já aplicadas?)`);
      if (seenSongs.has(id)) fail(`Grupo ${d.grupo}: música #${id} aparece em mais de uma decisão`);
      seenSongs.add(id);
    }
    if (remove.includes(keep)) fail(`Grupo ${d.grupo}: destino está na lista de remoção`);
    const plan: Plan = { grupo: d.grupo, keep, removeSongs: remove, move: [], discardArrangements: [] };
    if (d.decisao === "mesclar") {
      for (const m of d.mover) {
        if (arrOwner.get(m.arranjo) !== m.deMusica || !remove.includes(m.deMusica)) fail(`Grupo ${d.grupo}: arranjo ${m.arranjo} não pertence à música ${m.deMusica}`);
        plan.move.push({ arrangementId: m.arranjo, name: m.nome });
      }
      for (const a of d.descartarArranjos) if (!remove.includes(arrOwner.get(a) ?? -1)) fail(`Grupo ${d.grupo}: arranjo ${a} não é de uma música removida`);
      plan.discardArrangements.push(...d.descartarArranjos);
    }
    plans.push(plan);
  }

  // ---- resumo
  const removedIds = plans.flatMap((p) => p.removeSongs);
  const serviceCopies = await prisma.songArrangement.findMany({
    where: { isServiceArrangement: true, songId: { in: removedIds } },
    select: { id: true, songId: true },
  });
  for (const p of plans) {
    const t = (id: number) => `#${id} "${byId.get(id)!.title}"`;
    const tags = new Set(byId.get(p.keep)!.tags.map((x) => x.id));
    const newTags = p.removeSongs.flatMap((r) => byId.get(r)!.tags).filter((x) => !tags.has(x.id));
    const copies = serviceCopies.filter((c) => p.removeSongs.includes(c.songId)).length;
    console.log(
      `Grupo ${p.grupo}: fica ${t(p.keep)}; exclui ${p.removeSongs.map(t).join(", ")}` +
        (p.move.length ? ` | move ${p.move.length} arranjo(s): ${p.move.map((m) => `${m.arrangementId} → "${m.name}"`).join("; ")}` : "") +
        (newTags.length ? ` | tags somadas: ${[...new Set(newTags.map((x) => x.name))].join(", ")}` : "") +
        (copies ? ` | ${copies} cópia(s) de culto repontada(s)` : ""),
    );
  }
  console.log(`\n${plans.length} grupos, ${removedIds.length} músicas a excluir, ${plans.reduce((n, p) => n + p.move.length, 0)} arranjos movidos.`);
  if (!apply) { console.log("DRY-RUN: nada foi gravado. Use --apply para gravar."); return; }

  // ---- backup + gravação (uma transação)
  const affected = new Set(plans.flatMap((p) => [p.keep, ...p.removeSongs]));
  const backup = songs.filter((s) => affected.has(s.id)).map((s) => ({
    id: s.id, isDeleted: s.isDeleted, tagIds: s.tags.map((t) => t.id), arrangements: s.arrangements,
    serviceCopySongIds: serviceCopies.filter((c) => c.songId === s.id).map((c) => c.id),
  }));
  const name = `backup-duplicatas-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(name, JSON.stringify(backup, null, 2), "utf-8");
  console.log(`Backup do estado anterior → ${name}`);

  const ops = [];
  for (const p of plans) {
    const moving = new Set(p.move.map((m) => m.arrangementId));
    const tagIds = [...new Set(p.removeSongs.flatMap((r) => byId.get(r)!.tags.map((t) => t.id)))];
    if (tagIds.length) ops.push(prisma.song.update({ where: { id: p.keep }, data: { tags: { connect: tagIds.map((id) => ({ id })) } } }));
    for (const m of p.move)
      ops.push(prisma.songArrangement.update({ where: { id: m.arrangementId }, data: { songId: p.keep, name: m.name, isDefault: false } }));
    // Cópias de culto passam a apontar para a música que fica.
    ops.push(prisma.songArrangement.updateMany({ where: { isServiceArrangement: true, songId: { in: p.removeSongs } }, data: { songId: p.keep } }));
    // Demais arranjos (não movidos, não de culto) das músicas removidas ficam excluídos.
    ops.push(prisma.songArrangement.updateMany({
      where: { songId: { in: p.removeSongs }, isServiceArrangement: false, id: { notIn: [...moving] } },
      data: { isDeleted: true, isDefault: false },
    }));
    ops.push(prisma.song.updateMany({ where: { id: { in: p.removeSongs } }, data: { isDeleted: true } }));
  }
  await prisma.$transaction(ops);
  console.log(`✓ ${plans.length} grupos aplicados.`);
}

main().catch((e) => { console.error("ERRO:", e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
