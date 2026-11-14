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
    // inteiro". `ring` (box-shadow por baixo dos panos), não `border-2`:
    // achado em teste manual — border-width conta pro box model
    // (box-sizing:border-box), então engrossar a borda empurrava o
    // conteúdo 1px pra dentro. ring nunca participa do layout, só pinta por
    // cima/por fora — cresce sem mover nada. A borda normal (1px, cor
    // suave) fica intocada por baixo; o ring (mais grosso, mesma cor viva
    // do circleBackground) é o que dá a sensação de "borda mais forte".
    // Classe completa (variante+utilitário) porque o scanner do Tailwind só
    // pega token literal e contíguo no código-fonte — nunca combinar
    // variante e cor por string interpolada (ver chord-item-tokens.ts/
    // BlockBody.tsx pra outros exemplos do mesmo cuidado neste projeto).
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
    circleBackground: "bg-block-intro-dot",
    background: "bg-block-intro-bg",
    text: "text-block-intro-text",
    border: "border-block-intro-border",
    comment: "bg-block-intro-comment text-block-intro-comment-text border-block-intro-comment",
    repeatBadge: "bg-block-intro-badge-bg text-block-intro-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-intro-dot",
    handleBackground: "bg-block-intro-handle hover:bg-block-intro-handle-hover",
  },
  VERSE: {
    circleBackground: "bg-block-verse-dot",
    background: "bg-block-verse-bg",
    text: "text-block-verse-text",
    border: "border-block-verse-border",
    comment: "bg-block-verse-comment text-block-verse-comment-text border-block-verse-comment",
    repeatBadge: "bg-block-verse-badge-bg text-block-verse-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-verse-dot",
    handleBackground: "bg-block-verse-handle hover:bg-block-verse-handle-hover",
  },
  PRECHORUS: {
    circleBackground: "bg-block-prechorus-dot",
    background: "bg-block-prechorus-bg",
    text: "text-block-prechorus-text",
    border: "border-block-prechorus-border",
    comment: "bg-block-prechorus-comment text-block-prechorus-comment-text border-block-prechorus-comment",
    repeatBadge: "bg-block-prechorus-badge-bg text-block-prechorus-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-prechorus-dot",
    handleBackground: "bg-block-prechorus-handle hover:bg-block-prechorus-handle-hover",
  },
  CHORUS: {
    circleBackground: "bg-block-chorus-dot",
    background: "bg-block-chorus-bg",
    text: "text-block-chorus-text",
    border: "border-block-chorus-border",
    comment: "bg-block-chorus-comment text-block-chorus-comment-text border-block-chorus-comment",
    repeatBadge: "bg-block-chorus-badge-bg text-block-chorus-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-chorus-dot",
    handleBackground: "bg-block-chorus-handle hover:bg-block-chorus-handle-hover",
  },
  BRIDGE: {
    circleBackground: "bg-block-bridge-dot",
    background: "bg-block-bridge-bg",
    text: "text-block-bridge-text",
    border: "border-block-bridge-border",
    comment: "bg-block-bridge-comment text-block-bridge-comment-text border-block-bridge-comment",
    repeatBadge: "bg-block-bridge-badge-bg text-block-bridge-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-bridge-dot",
    handleBackground: "bg-block-bridge-handle hover:bg-block-bridge-handle-hover",
  },
  INTERLUDE: {
    circleBackground: "bg-block-interlude-dot",
    background: "bg-block-interlude-bg",
    text: "text-block-interlude-text",
    border: "border-block-interlude-border",
    comment: "bg-block-interlude-comment text-block-interlude-comment-text border-block-interlude-comment",
    repeatBadge: "bg-block-interlude-badge-bg text-block-interlude-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-interlude-dot",
    handleBackground: "bg-block-interlude-handle hover:bg-block-interlude-handle-hover",
  },
  SOLO: {
    circleBackground: "bg-block-solo-dot",
    background: "bg-block-solo-bg",
    text: "text-block-solo-text",
    border: "border-block-solo-border",
    comment: "bg-block-solo-comment text-block-solo-comment-text border-block-solo-comment",
    repeatBadge: "bg-block-solo-badge-bg text-block-solo-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-solo-dot",
    handleBackground: "bg-block-solo-handle hover:bg-block-solo-handle-hover",
  },
  ENDING: {
    circleBackground: "bg-block-ending-dot",
    background: "bg-block-ending-bg",
    text: "text-block-ending-text",
    border: "border-block-ending-border",
    comment: "bg-block-ending-comment text-block-ending-comment-text border-block-ending-comment",
    repeatBadge: "bg-block-ending-badge-bg text-block-ending-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-ending-dot",
    handleBackground: "bg-block-ending-handle hover:bg-block-ending-handle-hover",
  },
  BLOCK: {
    circleBackground: "bg-block-block-dot",
    background: "bg-block-block-bg",
    text: "text-block-block-text",
    border: "border-block-block-border",
    comment: "bg-block-block-comment text-block-block-comment-text border-block-block-comment",
    repeatBadge: "bg-block-block-badge-bg text-block-block-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-block-dot",
    handleBackground: "bg-block-block-handle hover:bg-block-block-handle-hover",
  },
  TEXT: {
    circleBackground: "bg-block-text-dot",
    background: "bg-block-text-bg",
    text: "text-block-text-text",
    border: "border-block-text-border",
    comment: "bg-block-text-comment text-block-text-comment-text border-block-text-comment",
    repeatBadge: "bg-block-text-badge-bg text-block-text-badge-text",
    borderHandleHover: "has-[[data-drag-handle]:hover]:ring-2 has-[[data-drag-handle]:hover]:ring-block-text-dot",
    handleBackground: "bg-block-text-handle hover:bg-block-text-handle-hover",
  },
};
