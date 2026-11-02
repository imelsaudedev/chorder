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

/**
 * Forma do rótulo de convenção na LEITURA: um chip com a face esquerda reta e a direita levemente
 * arredondada (4px). As cores (fundo escuro do tipo do bloco + texto branco) vêm de
 * `commentClass` (unit-colors.ts). Paddings em `em` do próprio chip (que tem 0.75em da fonte ao
 * redor): ~1.1em de altura no total.
 */
export const COMMENT_CHIP_SHAPE_CLASS = "rounded-r-[4px] px-[0.6em] py-[0.25em]";

/**
 * Posição do rótulo de convenção EMPARELHADA (acima do acorde que ela rotula). O topo é o mesmo da
 * linha pontilhada (COMMENT_CONNECTOR_POSITION_CLASS): a linha sobe inteira até o topo do chip.
 * `left`: a linha fica em 0.25em e tem 1px de largura; o chip começa 1px depois dela
 * (0.25em + 1px da linha + 1px de folga), sem encostar. O topo (-1.5em) deixa o chip um pouco
 * acima do acorde/letra embaixo, com um vão leve entre os dois.
 */
export const COMMENT_LABEL_POSITION_CLASS = `absolute -top-[1.5em] left-[calc(0.25em+2px)] whitespace-nowrap ${COMMENT_CHIP_SHAPE_CLASS}`;

/**
 * Linha pontilhada que conecta a convenção emparelhada ao acorde abaixo, do topo do chip até a
 * base do item. Recebe o mesmo `commentClass` do rótulo (cor da borda), que agora traz também o
 * fundo escuro do chip: `bg-transparent!` (importante) o anula aqui — a caixa tem só a largura
 * da borda de 1px e um fundo preencheria os vãos do pontilhado, deixando a linha sólida.
 */
export const COMMENT_CONNECTOR_POSITION_CLASS =
  "absolute -top-[1.5em] left-[0.25em] bottom-0 w-0 border-l border-dotted bg-transparent!";

/** Cores da convenção quando quem chama não informa as do tipo do bloco (fundo escuro + texto branco). */
export const DEFAULT_COMMENT_CLASS = "bg-zinc-700 text-white border-zinc-700";

/** Recuo do item quando ele tem uma convenção emparelhada acima (abre espaço pro rótulo). */
export const ITEM_WITH_COMMENT_PADDING_CLASS = "pl-[0.5625em]";
