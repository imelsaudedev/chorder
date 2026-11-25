"use client";

import { transposeChord } from "@/chopro/music";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { currentRoot, formatKey, isSameShift } from "../KeyButtonSet/key-utils";

type Props = {
  originalKey: string;
  /** Tom em que esta pessoa está tocando (semitons sobre o tom original). */
  transpose: number;
  /** Tom que o grupo decidiu para o culto (semitons sobre o tom original). */
  cultoTranspose: number;
  onReset: () => void;
};

/**
 * Botão "Voltar ao original: G", que leva ao tom decidido para o culto (o tom mostra para onde volta).
 * O ajuste de tom é só local; esta é a rede de segurança contra ficar sem querer num tom diferente do
 * grupo. Não renderiza nada quando o tom deste aparelho já é o do culto.
 */
export default function ServiceKeyNotice({ originalKey, transpose, cultoTranspose, onReset }: Props) {
  const t = useTranslations("ServiceView");
  // Módulo 12: -17 e +7 são o mesmo tom (o deslocamento do culto vem do banco sem normalização).
  if (isSameShift(transpose, cultoTranspose)) return null;
  const cultoRoot = currentRoot(originalKey, cultoTranspose, null);
  const cultoKey = cultoRoot ? formatKey(cultoRoot) : transposeChord(originalKey, originalKey, cultoTranspose);
  return (
    <Button type="button" variant="outline" size="sm" onClick={onReset} className="w-full">
      {t("backToOriginalKey", { key: cultoKey })}
    </Button>
  );
}
