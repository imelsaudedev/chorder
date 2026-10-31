"use client";

import { transposeChord } from "@/chopro/music";
import { SongConfigContext } from "@/components/config/SongConfig";
import BlockEditor from "@/components/song/BlockEditor";
import { useResponsiveColumns } from "@/hooks/useResponsiveColumns";
import { ClientSongUnit } from "@/prisma/models";
import { useContext } from "react";
import { useFormContext } from "react-hook-form";

// Ponte entre o BlockEditor (controlado por props simples: units +
// onChangeUnits) e os dois formulários reais que antes usavam
// SongUnitListForm (field array do react-hook-form) — Etapa 6 do
// PLANO.md: ArrangementForm (catálogo) e ServiceSongUnitEditForm
// (liturgia). Os dois usam o mesmo arrangementSchema/ArrangementSchema
// (campos "units" e "key"), então ler/escrever o campo "units" inteiro via
// useFormContext funciona nos dois sem precisar de field array nem de
// nada específico de cada tela.
//
// `className` controla o wrapper: o catálogo é uma página própria (precisa
// do próprio padding); a liturgia já vive dentro de um layout com padding
// (o antigo SongUnitListForm era chamado ali com sectionClassName="" pra
// zerar o padding padrão) — por isso o padrão aqui segue sendo o do
// catálogo, e quem for a liturgia passa className="".
type BlockEditorFormBridgeProps = {
  className?: string;
};

export default function BlockEditorFormBridge({
  className = "px-4 sm:px-6 lg:px-8 py-8",
}: BlockEditorFormBridgeProps) {
  const { watch, setValue } = useFormContext();
  const units = (watch("units") as ClientSongUnit[] | undefined) ?? [];
  const baseKey = (watch("key") as string) || "C";
  const songConfig = useContext(SongConfigContext);
  // "Manter as colunas da view, não apenas uma coluna" — mesma resolução
  // de 0=automático que a leitura (ColumnViewer) já usa, não um fixo "1".
  const columns = useResponsiveColumns(songConfig?.columns ?? 0);
  const transpose = songConfig?.transpose ?? 0;
  // D9: a edição sempre acontece no tom SALVO (baseKey cru, nunca
  // transposto) — mas se o culto estiver com o tom do voz transposto,
  // avisar explicitamente (igual ao protótipo), já que o acorde mostrado
  // aqui não é o mesmo que a leitura está exibindo agora.
  const transposedKey = transpose !== 0 ? transposeChord(baseKey, baseKey, transpose) : baseKey;

  return (
    <div className={className}>
      {transpose !== 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          Editando no tom salvo ({baseKey}). O tom do culto ({transposedKey}) volta ao salvar.
        </p>
      )}
      <BlockEditor
        units={units}
        columns={columns}
        baseKey={baseKey}
        enharmonicPreference={songConfig?.enharmonicPreference ?? null}
        onChangeUnits={(next) =>
          setValue("units", next, { shouldDirty: true, shouldValidate: true })
        }
      />
    </div>
  );
}
