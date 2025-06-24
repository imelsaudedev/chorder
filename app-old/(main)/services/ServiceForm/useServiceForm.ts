import { ServiceWithUnits } from "@/prisma/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import schema, { ServiceFormSchema } from "./schema";

export function useServiceForm(service: ServiceWithUnits) {
  return useForm<ServiceFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: service.slug,
      title: service.title || "",
      worshipLeader: service.worshipLeader || "",
      date: service.date,
      units: service.units.map((unit) => {
        if (unit.type === "SONG") {
          const arrangement = unit.arrangement;
          return {
            type: "SONG",
            semitoneTranspose: unit.semitoneTranspose,
            songId: arrangement.songId,
            arrangement: {
              title: arrangement.song.title,
              artist: arrangement.song.artist ?? undefined,
              arrangementId: arrangement.id,
              arrangementName: arrangement.name || "",
              key: arrangement.key || "C",
              units: arrangement.units,
            },
          };
        }
        throw new Error("Invalid unit type");
      }),
    },
  });
}
