import { ClientSong, SongArrangementWithUnits } from "@/prisma/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useFormContext } from "react-hook-form";
import schema, { ArrangementFormSchema } from "./schema";

export function initForm(
  song?: ClientSong,
  arrangement?: SongArrangementWithUnits
) {
  return {
    mode: "onChange" as const,
    resolver: zodResolver(schema),
    defaultValues: {
      title: song?.title ?? "",
      artist: song?.artist ?? "",
      arrangementId: arrangement?.id,
      arrangementName: arrangement?.name ?? "",
      key: arrangement?.key ?? "",
      units: arrangement?.units,
    },
  };
}

export function useArrangementUnitsFieldArray() {
  const { control, watch } = useFormContext<ArrangementFormSchema>();
  const { fields: _, ...rest } = useFieldArray({
    name: "units",
    control,
    rules: {
      minLength: 1,
      required: true,
    },
  });
  return {
    units: watch("units"),
    ...rest,
  };
}
