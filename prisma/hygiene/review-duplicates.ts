// Gera uma página HTML LOCAL para revisar possíveis duplicatas lado a lado, com prévia das cifras.
// Somente leitura. Os dados ficam só no arquivo gerado (não sobem para lugar nenhum).
//   npx tsx prisma/hygiene/review-duplicates.ts [duplicados.html]
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import {
  chordLine, findDuplicateEdges, isPlausibleChord, isTomUnit, type HSong,
} from "@/lib/hygiene/analyze";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.song.findMany({
    where: { isDeleted: false },
    select: {
      id: true, title: true, slug: true, artist: true, isDeleted: true,
      tags: { select: { name: true, group: { select: { name: true } } } },
      arrangements: {
        where: { isServiceArrangement: false, isDeleted: false },
        select: {
          id: true, name: true, key: true, isDefault: true, isDeleted: true, isServiceArrangement: true,
          originalArrangementId: true, youtubeUrl: true,
          units: { select: { id: true, type: true, content: true, order: true, repeatCount: true }, orderBy: { order: "asc" } },
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { title: "asc" },
  });
  const songs: HSong[] = rows.map((s) => ({
    ...s, arrangements: s.arrangements.map((a) => ({ ...a, hasServiceUnit: false })),
  }));

  // Pares candidatos: título E letra (ver findDuplicateEdges). Clusters = componentes conectados.
  const { kept, dropped } = findDuplicateEdges(songs);
  const titleOf = new Map(songs.map((s) => [s.id, s.title]));
  const line = (e: { a: number; b: number; reason: string }) => `  #${e.a} "${titleOf.get(e.a)}"  ↔  #${e.b} "${titleOf.get(e.b)}"  [${e.reason}]`;
  console.log(`\nDESCARTADOS (título parecido, letra diferente): ${dropped.length}`);
  dropped.sort((x, y) => (y.sim ?? 0) - (x.sim ?? 0)).forEach((e) => console.log(line(e)));
  console.log(`\nACRESCENTADOS (letra igual, título diferente): ${kept.filter((e) => !e.title).length}`);
  kept.filter((e) => !e.title).forEach((e) => console.log(line(e)));

  // Componentes conectados de uma lista de pares.
  const cluster = (edges: { a: number; b: number }[]) => {
    const parent = new Map<number, number>();
    const find = (x: number): number => {
      const p = parent.get(x);
      if (p === undefined || p === x) return x;
      const r = find(p);
      parent.set(x, r);
      return r;
    };
    for (const e of edges) parent.set(find(e.a), find(e.b));
    const members = new Map<number, Set<number>>();
    for (const e of edges) for (const id of [e.a, e.b]) members.set(find(id), (members.get(find(id)) ?? new Set()).add(id));
    return [...members.values()].map((s) => [...s].sort((x, y) => x - y));
  };
  // Seção principal: título+letra confirmam. Seção "low": MESMO título mas letras diferentes
  // (provavelmente músicas distintas; fica no fim da página só para conferência).
  const lowEdges = dropped.filter((e) => e.title === "igual");
  const main = cluster(kept).map((ids) => ({ ids, tier: "main" as const, edges: kept.filter((e) => ids.includes(e.a)) }));
  const low = cluster(lowEdges).map((ids) => ({ ids, tier: "low" as const, edges: lowEdges.filter((e) => ids.includes(e.a)) }));
  const clusters = [...main, ...low];
  const allIds = clusters.flatMap((c) => c.ids);

  // Uso em cultos (cópias de arranjo cujo original pertence à música).
  const arrToSong = new Map<number, number>();
  for (const s of rows) for (const a of s.arrangements) arrToSong.set(a.id, s.id);
  const uses = await prisma.serviceUnit.findMany({
    where: { service: { isDeleted: false }, arrangement: { originalArrangementId: { in: [...arrToSong.keys()] } } },
    select: { arrangement: { select: { originalArrangementId: true } }, service: { select: { id: true, date: true } } },
  });
  const usage = new Map<number, { services: Set<number>; last: Date | null }>();
  for (const u of uses) {
    const sid = arrToSong.get(u.arrangement!.originalArrangementId!);
    if (!sid) continue;
    const e = usage.get(sid) ?? { services: new Set<number>(), last: null };
    e.services.add(u.service.id);
    if (!e.last || u.service.date > e.last) e.last = u.service.date;
    usage.set(sid, e);
  }

  const byId = new Map(rows.map((s) => [s.id, s]));
  const data = clusters.map(({ ids, tier, edges }, i) => {
    const sample = byId.get(ids[0])!;
    const items = ids.map((id) => {
      const s = byId.get(id)!;
      const u = usage.get(id);
      const arrs = s.arrangements.map((a) => {
        const blocks = a.units.map((b) => {
          if (isTomUnit(b as never)) return null;
          const lines = b.content.replace(/\r/g, "").split("\n").map(chordLine);
          return { type: b.type, repeat: b.repeatCount, lines, bad: lines.flatMap((l) => l.names).filter((n) => !isPlausibleChord(n)) };
        }).filter(Boolean);
        const chordCount = blocks.reduce((n, b) => n + b!.lines.reduce((m, l) => m + l.names.length, 0), 0);
        return { id: a.id, name: a.name, key: a.key, isDefault: a.isDefault, chordCount, blocks };
      });
      const typed = arrs.flatMap((a) => a.blocks).filter((b) => b!.type !== "BLOCK").length;
      const score = arrs.length + (u?.services.size ?? 0) * 3 + typed * 0.1 + arrs.reduce((n, a) => n + (a.chordCount > 0 ? 1 : 0), 0);
      return {
        id, title: s.title, artist: s.artist, tags: s.tags.map((t) => `${t.group.name}: ${t.name}`),
        uses: u?.services.size ?? 0, lastUse: u?.last?.toISOString().slice(0, 10) ?? null, score, arrs,
      };
    });
    const best = [...items].sort((a, b) => b.score - a.score)[0].id;
    const why = edges.map((e) => `#${e.a} ↔ #${e.b}: ${e.reason}`);
    return { n: i + 1, tier, why: why.join(" · "), sample: sample.title, suggestedKeep: best, items };
  });

  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  writeFileSync(process.argv[2] ?? "duplicados.html", HTML.replace("__DATA__", json), "utf-8");
  console.log(`${data.length} grupos (${allIds.length} músicas) → ${process.argv[2] ?? "duplicados.html"}`);
}

const HTML = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisão de duplicatas</title>
<style>
:root{--bg:#f8fafc;--fg:#0f172a;--mut:#64748b;--card:#fff;--bd:#e2e8f0;--ok:#059669;--warn:#d97706;--bad:#dc2626}
@media(prefers-color-scheme:dark){:root{--bg:#0b1220;--fg:#e2e8f0;--mut:#94a3b8;--card:#111a2e;--bd:#24304a}}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.4 system-ui,sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--bd);padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
main{padding:16px;display:grid;gap:20px}
.group{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:14px}
.group.done{border-color:var(--ok)}
.cols{display:flex;gap:12px;overflow-x:auto;align-items:flex-start}
.col{flex:1 0 340px;max-width:520px;border:1px solid var(--bd);border-radius:10px;padding:10px}
.col.keep{border:2px solid var(--ok)}
h2{margin:24px 0 0;font-size:17px}h3{margin:0 0 4px;font-size:15px}.mut{color:var(--mut);font-size:13px}
.pill{display:inline-block;border:1px solid var(--bd);border-radius:99px;padding:1px 8px;font-size:12px;margin:2px 4px 2px 0}
.warn{color:var(--warn)}.bad{color:var(--bad)}
pre{margin:6px 0;font:13px/1.25 ui-monospace,Consolas,monospace;overflow-x:auto;white-space:pre}
.ch{color:var(--ok);font-weight:700;display:block}.ly{display:block}
.blk{border-left:3px solid var(--bd);padding-left:8px;margin:8px 0}.blk b{font-size:11px;color:var(--mut)}
details{margin-top:6px}summary{cursor:pointer;font-weight:600}
button,label.opt{font:inherit;border:1px solid var(--bd);background:var(--card);color:var(--fg);border-radius:8px;padding:5px 10px;cursor:pointer}
.opts{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}
</style>
<header><b>Duplicatas</b><span id="prog" class="mut"></span><button id="exp">Baixar decisoes.json</button><span class="mut">Suas escolhas ficam salvas neste navegador.</span></header>
<main id="m"></main>
<script>
const DATA=__DATA__;
const KEY="decisoes-duplicatas";let dec={};try{dec=JSON.parse(localStorage.getItem(KEY)||"{}")}catch{}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(dec))}catch{}; prog()};
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
function prog(){const d=DATA.filter(g=>dec[g.n]).length;document.getElementById("prog").textContent=d+" de "+DATA.length+" decididos";document.querySelectorAll(".group").forEach(el=>el.classList.toggle("done",!!dec[el.dataset.n]))}
function blocks(a){return a.blocks.map(b=>'<div class="blk"><b>'+b.type+(b.repeat>1?' ×'+b.repeat:'')+'</b><pre>'+b.lines.map(l=>(l.chords?'<span class="ch">'+esc(l.chords)+'</span>':'')+'<span class="ly">'+esc(l.lyrics||" ")+'</span>').join('')+'</pre>'+(b.bad.length?'<div class="bad">acordes estranhos: '+esc(b.bad.join(", "))+'</div>':'')+'</div>').join('')}
function col(g,it){const keep=dec[g.n]&&dec[g.n].keep===it.id;
return '<div class="col'+(keep?' keep':'')+'"><h3>#'+it.id+' '+esc(it.title)+(g.suggestedKeep===it.id?' <span class="pill">sugerida</span>':'')+'</h3><div class="mut">'+esc(it.artist||"sem artista")+'</div>'+
'<div><span class="pill">'+it.arrs.length+' arranjo(s)</span><span class="pill">'+it.uses+' culto(s)'+(it.lastUse?' · último '+it.lastUse:'')+'</span>'+it.tags.map(t=>'<span class="pill">'+esc(t)+'</span>').join('')+'</div>'+
it.arrs.map((a,i)=>'<details'+(i===0?' open':'')+'><summary>Tom '+esc(a.key)+(a.name?' · '+esc(a.name):'')+' <span class="'+(a.chordCount?'mut':'warn')+'">'+(a.chordCount?a.chordCount+' acordes':'SEM ACORDES')+'</span></summary>'+blocks(a)+'</details>').join('')+
'<div class="opts"><button data-g="'+g.n+'" data-keep="'+it.id+'">Manter esta</button></div></div>'}
function render(){document.getElementById("m").innerHTML=DATA.map((g,i)=>(g.tier==="low"&&(i===0||DATA[i-1].tier!=="low")?'<h2>Mesmo título, mas letras diferentes <span class="mut">— provavelmente são músicas distintas; confira só se quiser</span></h2>':'')+'<section class="group" data-n="'+g.n+'"><div class="mut">Grupo '+g.n+' · '+esc(g.why)+'</div><div class="cols">'+g.items.map(it=>col(g,it)).join('')+'</div><div class="opts"><button data-g="'+g.n+'" data-notdup="1">Não são duplicatas</button><button data-g="'+g.n+'" data-clear="1">Limpar</button><span class="mut">'+(dec[g.n]?(dec[g.n].notDuplicate?'Decisão: não é duplicata':'Decisão: manter #'+dec[g.n].keep):'Sem decisão')+'</span></div></section>').join('');prog()}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
if(b.id==="exp"){const out=DATA.map(g=>({grupo:g.n,decisao:dec[g.n]?(dec[g.n].notDuplicate?"nao_duplicata":"manter"):"pendente",manter:dec[g.n]&&dec[g.n].keep||null,remover:dec[g.n]&&dec[g.n].keep?g.items.map(i=>i.id).filter(i=>i!==dec[g.n].keep):[]}));
const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:"application/json"}));a.download="decisoes.json";a.click();return}
const n=b.dataset.g;if(!n)return;
if(b.dataset.keep)dec[n]={keep:+b.dataset.keep};else if(b.dataset.notdup)dec[n]={notDuplicate:true};else delete dec[n];
const y=scrollY;save();render();scrollTo(0,y)});
render();
</script></html>`;

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
