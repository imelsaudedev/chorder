// Geometria e tipografia compartilhadas entre a LEITURA (ChordProLine/Item.tsx)
// e a EDIÇÃO (BlockEditor/BlockBody.tsx) do mesmo conceito visual: acorde
// acima da sílaba, convenção acima do acorde. As duas implementações
// desenhavam o mesmo padrão com os mesmos números copiados a mão em dois
// lugares — sem nada impedindo que um dia divergissem sem ninguém notar
// (achado: "podíamos aproveitar para padronização geral deste elemento").
//
// Valores em `em` de propósito, não em rem/px: escalam com o tamanho de
// fonte do contexto onde o item está (densidade da cifra, Modo Palco) —
// trocar por um token fixo quebraria essa proporção. Isso NÃO é "pixel
// solto": é relativo à fonte do próprio elemento pai, de propósito.

/** Classe de texto do acorde — mono, negrito, condensado, cor neutra (nunca a cor do tipo do bloco). */
export const CHORD_TEXT_CLASS = "font-mono font-bold tracking-tighter text-foreground leading-none";

/** Tamanho/peso do texto da convenção — 75% do texto ao redor, por isso em `em`. */
export const COMMENT_LABEL_TEXT_CLASS = "text-[0.75em] font-semibold leading-none";

/** Posição do rótulo de convenção EMPARELHADA (acima do acorde que ela rotula). */
export const COMMENT_LABEL_POSITION_CLASS = "absolute -top-[1.375em] left-[0.5625em] whitespace-nowrap";

/** Linha pontilhada que conecta a convenção emparelhada ao acorde abaixo. */
export const COMMENT_CONNECTOR_POSITION_CLASS = "absolute -top-[1.125em] left-[0.25em] bottom-0 w-0 border-l border-dotted";

/** Recuo do item quando ele tem uma convenção emparelhada acima (abre espaço pro rótulo). */
export const ITEM_WITH_COMMENT_PADDING_CLASS = "pl-[0.5625em]";
