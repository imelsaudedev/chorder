import { defaultArrangementValues } from "@/components/song/ArrangementForm/useArrangementForm";
import { ClientService } from "@/prisma/models";
import { ServiceSchema, serviceSchema } from "@/schemas/service";
import { ServiceUnitSchema } from "@/schemas/service-unit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useFormContext, UseFormProps } from "react-hook-form";

export function initForm(
  service: ClientService | null
): UseFormProps<ServiceSchema> {
  return {
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      id: service?.id,
      slug: service?.slug ?? "",
      title: service?.title ?? "",
      worshipLeader: service?.worshipLeader ?? "",
      date: service?.date ?? new Date(),
      isDeleted: false,
      units:
        service?.units!.map((unit) => {
          if (unit.type === "SONG") {
            return {
              id: unit.id,
              type: "SONG",
              semitoneTranspose: unit.semitoneTranspose,
              serviceId: service.id ?? -1,
              arrangementId: unit.arrangement?.id ?? -1,
              arrangement: unit.arrangement
                ? defaultArrangementValues(unit.arrangement)
                : undefined,
              order: unit.order,
            };
          }
          throw new Error(`Unsupported unit type: ${unit.type}`);
        }) ?? [],
    } satisfies ClientService,
  };
}

export function useServiceUnitsFieldArray() {
  const { control, watch, setValue: globalSetValue, getValues: globalGetValues } = useFormContext();
  const setValue = (index: number, name: string, value: any) => {
    globalSetValue(`units.${index}.${name}`, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };
  const { fields, ...rest } = useFieldArray({
    name: "units",
    control,
    rules: {
      minLength: 1,
      required: true,
    },
  });
  return {
    fields,
    units: watch("units") as ServiceUnitSchema[],
    getValues: () => (globalGetValues("units") as ServiceUnitSchema[]) || [],
    setValue,
    ...rest,
  };
}
