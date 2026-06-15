"use client";

import { ClientService } from "@/prisma/models";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Mic2, MicVocal, Pencil } from "lucide-react";

type ServicePlanHeaderProps = {
  service: ClientService;
  onEdit: () => void;
};

export default function ServicePlanHeader({ service, onEdit }: ServicePlanHeaderProps) {
  const date = new Date(service.date);
  const dateStr = format(date, "d 'de' MMM. yyyy", { locale: ptBR });
  const timeStr = format(date, "HH:mm");

  return (
    <button
      type="button"
      onClick={onEdit}
      className="group w-full text-left px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-zinc-100/60 border-b border-zinc-200 hover:bg-zinc-100 transition-colors"
    >
      {/* Title row */}
      <div className="flex items-center gap-2 mb-2">
        <span className="flex-1 text-lg sm:text-xl font-semibold text-zinc-800 truncate">
          {service.title ?? (
            <span className="text-zinc-400 font-normal">Sem título</span>
          )}
        </span>
        <Pencil className="w-4 h-4 text-zinc-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          {dateStr}
        </span>

        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          {timeStr}
        </span>

        {service.worshipLeader && (
          <span className="flex items-center gap-1.5">
            <MicVocal className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            {service.worshipLeader}
          </span>
        )}

        {service.preacher && (
          <span className="flex items-center gap-1.5">
            <Mic2 className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            {service.preacher}
          </span>
        )}
      </div>
    </button>
  );
}
