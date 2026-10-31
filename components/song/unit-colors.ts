import { SongUnitType } from "@prisma/client";

export const unitColorClasses: {
  [type in SongUnitType]: {
    circleBackground: string;
    background: string;
    text: string;
    border: string;
    comment: string;
    repeatBadge: string;
    // Aceso quando o container TEM um descendente com [data-drag-handle] em
    // :hover (CSS puro, sem JS) — achado: "a alça acende a borda do bloco
    // inteiro". Mesma cor do circleBackground (o pontinho do seletor de
    // tipo), só que como borda — é a MESMA gradação da borda normal, não
    // uma cor nova, só mais viva. Classe completa (variante+utilitário)
    // porque o scanner do Tailwind só pega token literal e contíguo no
    // código-fonte — nunca combinar variante e cor por string interpolada
    // (ver chord-item-tokens.ts/BlockBody.tsx pra outros exemplos do mesmo
    // cuidado neste projeto).
    borderHandleHover: string;
    // Fundo da própria alça — achado: "equiparar visualmente o fundo deste
    // elemento com o botão... fundo levemente colorido, bordas
    // arredondadas, mais escuro no hover". -100 parado (um tom acima do
    // background do bloco, -50, pra não sumir nele) e -200 no hover (mesmo
    // tom da borda normal do bloco) — reaproveita a escala que já existe,
    // não inventa shade nova.
    handleBackground: string;
  };
} = {
  INTRO: {
    circleBackground: "bg-lime-300",
    background: "bg-lime-50",
    text: "text-lime-600",
    border: "border-lime-200",
    comment: "text-lime-600 border-lime-600",
    repeatBadge: "bg-lime-200 text-lime-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-lime-300",
    handleBackground: "bg-lime-100 hover:bg-lime-200",
  },
  VERSE: {
    circleBackground: "bg-cyan-400",
    background: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-200",
    comment: "text-cyan-600 border-cyan-600",
    repeatBadge: "bg-cyan-200 text-cyan-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-cyan-400",
    handleBackground: "bg-cyan-100 hover:bg-cyan-200",
  },
  PRECHORUS: {
    circleBackground: "bg-orange-400",
    background: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    comment: "text-orange-600 border-orange-600",
    repeatBadge: "bg-orange-200 text-orange-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-orange-400",
    handleBackground: "bg-orange-100 hover:bg-orange-200",
  },
  CHORUS: {
    circleBackground: "bg-rose-500",
    background: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    comment: "text-rose-700 border-rose-700",
    repeatBadge: "bg-rose-200 text-rose-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-rose-500",
    handleBackground: "bg-rose-100 hover:bg-rose-200",
  },
  BRIDGE: {
    circleBackground: "bg-violet-500",
    background: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    comment: "text-violet-700 border-violet-700",
    repeatBadge: "bg-violet-200 text-violet-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-violet-500",
    handleBackground: "bg-violet-100 hover:bg-violet-200",
  },
  INTERLUDE: {
    circleBackground: "bg-amber-500",
    background: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    comment: "text-amber-700 border-amber-700",
    repeatBadge: "bg-amber-200 text-amber-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-amber-500",
    handleBackground: "bg-amber-100 hover:bg-amber-200",
  },
  SOLO: {
    circleBackground: "bg-fuchsia-600",
    background: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
    comment: "text-fuchsia-700 border-fuchsia-700",
    repeatBadge: "bg-fuchsia-200 text-fuchsia-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-fuchsia-600",
    handleBackground: "bg-fuchsia-100 hover:bg-fuchsia-200",
  },
  ENDING: {
    circleBackground: "bg-lime-500",
    background: "bg-lime-50",
    text: "text-lime-700",
    border: "border-lime-200",
    comment: "text-lime-700 border-lime-700",
    repeatBadge: "bg-lime-200 text-lime-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-lime-500",
    handleBackground: "bg-lime-100 hover:bg-lime-200",
  },
  BLOCK: {
    circleBackground: "bg-zinc-400",
    background: "bg-zinc-50",
    text: "text-zinc-600",
    border: "border-zinc-200",
    comment: "text-zinc-600 border-zinc-600",
    repeatBadge: "bg-zinc-200 text-zinc-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-zinc-400",
    handleBackground: "bg-zinc-100 hover:bg-zinc-200",
  },
  TEXT: {
    circleBackground: "bg-slate-400",
    background: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    comment: "text-slate-600 border-slate-600",
    repeatBadge: "bg-slate-200 text-slate-700",
    borderHandleHover: "has-[[data-drag-handle]:hover]:border-2 has-[[data-drag-handle]:hover]:border-slate-400",
    handleBackground: "bg-slate-100 hover:bg-slate-200",
  },
};
