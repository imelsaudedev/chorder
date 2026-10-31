"use client";

import { transposeChord } from "@/chopro/music";
import { SongConfigContext } from "@/components/config/SongConfig";
import BlockEditor from "@/components/song/BlockEditor";
import { useResponsiveColumns } from "@/hooks/useResponsiveColumns";
import { ClientSongUnit } from "@/prisma/models";
import { useContext } from "react";
import { useFormContext } from "react-hook-form";

// Ponte TEMPORÁRIA pra testar o BlockEditor (Etapas 1-5 do PLANO.md) dentro
// da página real de edição, antes de decidir a integração definitiva da
// Etapa 6 (que ainda precisa olhar pro segundo consumidor de
// SongUnitListForm, o editor de liturgia, e decidir se os dois convivem ou
// se um substitui o outro). Aqui é só o suficiente pra testar em
// localhost:3000 com dados reais antes de abrir PR — não é a versão final.
//
// SongUnitListForm lê/escreve via useArrangementUnitsFieldArray (field
// array do react-hook-form); BlockEditor é controlado por props simples
// (units + onChangeUnits), então a ponte é só ler/escrever o campo "units"
// inteiro direto no form, sem field array.
export default function BlockEditorFormBridge() {
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
    <div className="px-4 sm:px-6 lg:px-8 py-8">
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
