"use client";

import Text from "@/components/common/Text";
import { ClientService } from "@/prisma/models";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Mic2, MicVocal, Pencil } from "lucide-react";

type ServicePlanHeaderProps = {
  service: ClientService;
  onEdit: () => void;
};

export default function ServicePlanHeader({ service, onEdit }: ServicePlanHeaderProps) {
  const date = new Date(service.date);
  const dateStr = format(date, "d 'de' MMM. yyyy · HH:mm", { locale: ptBR });

  return (
    <button
      type="button"
      onClick={onEdit}
      className="text-left w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-zinc-200/60 hover:bg-zinc-200/80 transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0 mb-1">
        <Text variant="heading-lg" className="truncate">
          {service.title ?? "Sem título"}
        </Text>
        <Pencil className="w-4 h-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <Text variant="caption" className="flex items-center gap-1">
          <Calendar className="w-3 h-3 shrink-0" />
          {dateStr}
        </Text>
        {service.worshipLeader && (
          <Text variant="caption" className="flex items-center gap-1 truncate">
            <MicVocal className="w-3 h-3 shrink-0" />
            {service.worshipLeader}
          </Text>
        )}
        {service.preacher && (
          <Text variant="caption" className="flex items-center gap-1 truncate">
            <Mic2 className="w-3 h-3 shrink-0" />
            {service.preacher}
          </Text>
        )}
      </div>
    </button>
  );
}
