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
 * Posição do rótulo de convenção EMPARELHADA (acima do acorde que ela rotula).
 *
 * ATENÇÃO às unidades: o chip tem `text-[0.75em]`, então um `em` DENTRO das classes dele vale
 * 0.75 da fonte do item (`b`), enquanto na linha pontilhada (conector) o `em` vale `b` cheio.
 * Os números abaixo já estão convertidos (valor em `b` ÷ 0.75), pra os dois baterem:
 * - altura do chip: 0.75b de texto + 2 × 0.1875b de padding = 1.125b;
 * - `top` -1.875em ⇒ -1.40625b: é o mesmo topo do conector (-1.40625em), a linha sobe inteira até o
 *   topo do chip; o chip termina em -0.28125b, ou seja, um vão de 0.28125b até o acorde/letra;
 * - `left` 0.33333em ⇒ 0.25b: mesma posição da linha; `ml-[2px]` empurra o chip pra depois da
 *   linha (1px de largura) mais 1px de folga — não encosta nela.
 */
export const COMMENT_LABEL_POSITION_CLASS = `absolute -top-[1.875em] left-[0.33333em] ml-[2px] whitespace-nowrap ${COMMENT_CHIP_SHAPE_CLASS}`;

/**
 * Linha pontilhada que conecta a convenção emparelhada ao acorde abaixo, do topo do chip (-1.40625b,
 * ver COMMENT_LABEL_POSITION_CLASS) até a base do item. Recebe o mesmo `commentClass` do rótulo
 * (cor da borda), que agora traz também o fundo escuro do chip: `bg-transparent!` (importante) o
 * anula aqui — a caixa tem só a largura da borda de 1px e um fundo preencheria os vãos do
 * pontilhado, deixando a linha sólida.
 */
export const COMMENT_CONNECTOR_POSITION_CLASS =
  "absolute -top-[1.40625em] left-[0.25em] bottom-0 w-0 border-l border-dotted bg-transparent!";

/** Cores da convenção quando quem chama não informa as do tipo do bloco (fundo escuro + texto branco). */
export const DEFAULT_COMMENT_CLASS = "bg-surface-inverse text-white border-surface-inverse";

/** Recuo do item quando ele tem uma convenção emparelhada acima (abre espaço pro rótulo). */
export const ITEM_WITH_COMMENT_PADDING_CLASS = "pl-[0.5625em]";
