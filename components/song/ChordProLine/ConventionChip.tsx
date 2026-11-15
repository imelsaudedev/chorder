import { COMMENT_CHIP_SHAPE_CLASS, COMMENT_LABEL_TEXT_CLASS } from "./chord-item-tokens";

type ConventionChipProps = {
  value: string;
  /** A linha tem letra: reserva a altura de uma linha de letra embaixo (igual ao que o item fazia). */
  hasLyrics: boolean;
  /** Cores do tipo do bloco: fundo escuro + texto branco (unit-colors.ts). */
  commentClass: string;
};

/**
 * Convenção "solta" — que não está acima de um trecho de letra (sozinha na linha, ou no fim dela) —,
 * no mesmo estilo do chip da convenção emparelhada: fundo escuro do tipo do bloco, texto branco,
 * face esquerda reta e direita arredondada. Sem linha pontilhada (não há trecho de letra abaixo
 * pra ligar); a face reta fica rente à borda do conteúdo.
 */
export default function ConventionChip({ value, hasLyrics, commentClass }: ConventionChipProps) {
  return (
    <div className="flex flex-col whitespace-pre-wrap mb-[var(--item-mb)]">
      <span className={`${COMMENT_LABEL_TEXT_CLASS} ${COMMENT_CHIP_SHAPE_CLASS} my-[0.5em] self-start ${commentClass}`}>
        {value}
      </span>
      {hasLyrics && <span className="invisible leading-none h-[1em]">&nbsp;</span>}
    </div>
  );
}
