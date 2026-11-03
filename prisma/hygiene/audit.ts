// Auditoria SOMENTE LEITURA da base de músicas. Não altera nada no banco.
//   DATABASE_URL=... npx tsx prisma/hygiene/audit.ts [saida.md]
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import {
  capitalizationIssue, findExactDuplicates, findNearDuplicates, findOrphans, findUntyped, suggestTitle, type HSong,
} from "@/lib/hygiene/analyze";

const prisma = new PrismaClient();
const row = (...c: (string | number)[]) => `| ${c.join(" | ")} |`;

async function main() {
  const rows = await prisma.song.findMany({
    select: {
      id: true, title: true, slug: true, artist: true, isDeleted: true,
      arrangements: {
        select: {
          id: true, name: true, isDeleted: true, isServiceArrangement: true, originalArrangementId: true,
          serviceUnit: { select: { id: true } },
          units: { select: { id: true, type: true, content: true, order: true }, orderBy: { order: "asc" } },
        },
      },
    },
    orderBy: { title: "asc" },
  });
  const songs: HSong[] = rows.map((s) => ({
    ...s,
    arrangements: s.arrangements.map(({ serviceUnit, ...a }) => ({ ...a, hasServiceUnit: !!serviceUnit })),
  }));
  const active = songs.filter((s) => !s.isDeleted);
  const byId = new Map(songs.map((s) => [s.id, s]));
  const t = (id: number) => `#${id} ${byId.get(id)?.title}`;
  const L: string[] = [`# Auditoria da base de músicas`, ``, `${active.length} músicas ativas (${songs.length - active.length} excluídas).`, ``];

  const dups = findExactDuplicates(active);
  L.push(`## 1. Duplicatas exatas (${dups.length} grupos)`, ``);
  for (const g of dups)
    L.push(`- ${g.map((s) => `#${s.id} "${s.title}" (${s.arrangements.filter((a) => !a.isServiceArrangement && !a.isDeleted).length} arranjos)`).join("  ↔  ")}`);
  const near = findNearDuplicates(active);
  L.push(``, `## 2. Possíveis duplicatas (títulos parecidos: ${near.length})`, ``);
  for (const [a, b, d] of near) L.push(`- #${a.id} "${a.title}" ↔ #${b.id} "${b.title}" (distância ${d})`);

  const caps = active.map((s) => ({ s, issue: capitalizationIssue(s.title), sug: suggestTitle(s.title) }))
    .filter((c) => c.issue || c.sug !== c.s.title);
  L.push(``, `## 3. Capitalização (${caps.length})`, ``, row("id", "atual", "problema", "sugestão"), row("--", "--", "--", "--"));
  for (const c of caps) L.push(row(c.s.id, c.s.title, c.issue ?? "diferente do padrão", c.sug));

  const orphans = findOrphans(songs);
  L.push(``, `## 4. Blocos/arranjos órfãos (${orphans.length})`, ``);
  for (const o of orphans) L.push(`- ${t(o.songId)}${o.arrangementId ? ` · arranjo ${o.arrangementId}` : ""}${o.unitId ? ` · bloco ${o.unitId}` : ""}: ${o.reason}`);

  const untyped = findUntyped(songs);
  L.push(``, `## 5. Blocos sem tipo (verso/refrão/etc.)`, ``);
  for (const kind of ["nenhum-tipado", "sem-verso-nem-refrao", "parcial"] as const) {
    const g = untyped.filter((u) => u.kind === kind);
    L.push(`### ${kind} (${g.length})`, ``);
    for (const u of g) L.push(`- ${t(u.songId)} · arranjo ${u.arrangementId}: ${u.untyped}/${u.blocks} sem tipo`);
    L.push(``);
  }

  const out = process.argv[2] ?? "auditoria-musicas.md";
  writeFileSync(out, L.join("\n"), "utf-8");
  console.log(`Relatório → ${out}  (duplicatas ${dups.length}, parecidas ${near.length}, capitalização ${caps.length}, órfãos ${orphans.length}, sem tipo ${untyped.length})`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
