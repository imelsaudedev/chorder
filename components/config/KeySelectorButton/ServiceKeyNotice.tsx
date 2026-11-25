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
 * Aviso de que o tom deste aparelho é diferente do decidido para o culto, com a saída de um toque.
 * O ajuste é só local; esta é a rede de segurança contra tocar sem querer num tom diferente do grupo.
 * Não renderiza nada quando os dois são iguais.
 */
export default function ServiceKeyNotice({ originalKey, transpose, cultoTranspose, onReset }: Props) {
  const t = useTranslations("ServiceView");
  // Módulo 12: -17 e +7 são o mesmo tom (o deslocamento do culto vem do banco sem normalização).
  if (isSameShift(transpose, cultoTranspose)) return null;
  const cultoRoot = currentRoot(originalKey, cultoTranspose, null);
  const cultoKey = cultoRoot ? formatKey(cultoRoot) : transposeChord(originalKey, originalKey, cultoTranspose);
  return (
    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
      <span>{t("keyOfService", { key: cultoKey })}</span>
      <Button type="button" variant="outline" size="sm" onClick={onReset}>
        {t("backToServiceKey")}
      </Button>
    </div>
  );
}
