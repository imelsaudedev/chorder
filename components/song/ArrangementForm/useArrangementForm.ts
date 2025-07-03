import { ClientArrangement, ClientSongUnit } from "@/prisma/models";
import { arrangementSchema } from "@/schemas/arrangement";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useFormContext } from "react-hook-form";

export function initForm(arrangement: ClientArrangement | null) {
  return {
    mode: "onChange" as const,
    resolver: zodResolver(arrangementSchema),
    defaultValues: {
      id: arrangement?.id,
      name: arrangement?.name ?? "",
      songId: arrangement?.songId,
      key: arrangement?.key ?? "C",
      isDefault: arrangement?.songId ? arrangement.isDefault : true,
      isDeleted: false,
      isServiceArrangement: arrangement?.isServiceArrangement ?? false,
      song: {
        id: arrangement?.songId,
        slug: arrangement?.song?.slug ?? "",
        lyrics: arrangement?.song?.lyrics ?? "",
        title: arrangement?.song?.title ?? "",
        artist: arrangement?.song?.artist ?? "",
        isDeleted: false,
      },
      units: arrangement?.units,
    } satisfies ClientArrangement,
  };
}

export function useArrangementUnitsFieldArray(fieldPrefix: string = "") {
  const { control, watch } = useFormContext();
  const { fields: _, ...rest } = useFieldArray({
    name: `${fieldPrefix}units`,
    control,
    rules: {
      minLength: 1,
      required: true,
    },
  });
  return {
    units: watch(`${fieldPrefix}units`) as ClientSongUnit[],
    ...rest,
  };
}
