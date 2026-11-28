"use client";

import LeaderAvatars from "@/components/service/LeaderAvatars";
import { leadersOf } from "@/lib/service-leaders";
import { summarizeSermons } from "@/lib/sermon-summary";
import Text from "@/components/common/Text";
import { ClientService } from "@/prisma/models";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Lock, Mic2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { countPlanProgress } from "./unitSummary";

type ServicePlanHeaderProps = {
  service: ClientService;
  onEdit: () => void;
  /** Barra compacta (altura próxima à do rodapé), usada quando a lista está rolada. */
  compact?: boolean;
};

// Cabeçalho do modo de edição: fundo tingido indica que a tela é editável.
// No topo mostra título, data, dirigente e pregador; ao rolar, encolhe para
// uma barra só com título e progresso (o clique continua abrindo as informações).
export default function ServicePlanHeader({ service, onEdit, compact = false }: ServicePlanHeaderProps) {
  const t = useTranslations("Service");
  const date = new Date(service.date);
  const dateStr = format(date, "d 'de' MMM. yyyy · HH:mm", { locale: ptBR });
  const { filled, total } = countPlanProgress(service.plan?.sections ?? []);
  const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
  const isDraft = service.status === "DRAFT";
  // O pregador vem do item Sermão (ao vivo, enquanto se edita); culto só de canções não tem.
  const preacher = summarizeSermons(service.plan).preacher;
  // Culto salvo: as pessoas e as fotos vêm de `leaderPeople` (culto antigo, só com o texto, fica sem foto).
  // Culto novo, ainda sem `leaderPeople`: as pessoas escolhidas na gaveta, com as iniciais até salvar.
  const leaderPeople =
    service.leaderPeople ?? leadersOf(service).map((l) => ({ userId: l.userId, name: l.name, image: null }));

  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label="Editar informações do culto"
      className={`cursor-pointer flex w-full flex-col justify-center text-left px-4 sm:px-6 lg:px-8 bg-muted/50 hover:bg-muted/70 transition-[padding,background-color] duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50 ${
        compact ? "min-h-14 py-2.5" : "py-4 sm:py-5"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Text
            variant="heading-lg"
            as="h1"
            size={compact ? "lg" : undefined}
            className="truncate transition-[font-size] duration-200 motion-reduce:transition-none"
          >
            {service.title?.trim() || "Sem título"}
          </Text>
          {isDraft && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-warning-border bg-warning-bg px-2 py-0.5 text-xs font-medium text-warning-text">
              <Lock className="size-3" aria-hidden="true" />
              {t("privateDraftBadge")}
            </span>
          )}
          <Pencil className="w-4 h-4 shrink-0 text-muted-foreground" />
        </div>
        {total > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <span
              aria-hidden="true"
              className="hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-border sm:block"
            >
              <span className="block h-full rounded-full bg-secondary" style={{ width: `${percent}%` }} />
            </span>
            <Text variant="caption" className="whitespace-nowrap text-foreground/80">
              {filled} de {total}
              <span className="hidden md:inline"> {total === 1 ? "preenchido" : "preenchidos"}</span>
            </Text>
          </div>
        )}
      </div>

      {/* Detalhes: recolhem (altura e opacidade) quando a barra fica compacta */}
      <div
        aria-hidden={compact}
        className={`grid transition-[grid-template-rows,opacity,margin] duration-200 motion-reduce:transition-none ${
          compact ? "mt-0 grid-rows-[0fr] opacity-0" : "mt-1 grid-rows-[1fr] opacity-100"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
            <Text variant="caption" className="flex items-center gap-1 text-foreground/80">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {dateStr}
            </Text>
            {service.worshipLeader && (
              <Text variant="caption" className="flex items-center gap-1.5 truncate text-foreground/80">
                {leaderPeople.length > 0 && <LeaderAvatars people={leaderPeople} />}
                {service.worshipLeader}
              </Text>
            )}
            {preacher && (
              <Text variant="caption" className="flex items-center gap-1 truncate text-foreground/80">
                <Mic2 className="w-3.5 h-3.5 shrink-0" />
                {preacher}
              </Text>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
