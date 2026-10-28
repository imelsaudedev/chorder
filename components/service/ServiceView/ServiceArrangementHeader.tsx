import Heading from "@/components/common/Heading";
import { useSongConfig } from "@/components/config/SongConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientArrangement } from "@/prisma/models";
import { forwardRef } from "react";

// Só o título é sticky — tom, referências, salvar/cancelar, aviso de plano
// e mapa rolam com a página (ver D1 na análise/plano: cabeçalho inteiro
// sticky ocupava espaço demais no celular). Salvar/Cancelar ficam no mesmo
// lugar do lápis, em ServiceArrangementMeta, pra não pular de posição.
type ServiceArrangementHeaderProps = {
  arrangement: ClientArrangement | null;
  order: number;
  isStuck?: boolean;
};

const ServiceArrangementHeader = forwardRef<HTMLDivElement, ServiceArrangementHeaderProps>(
function ServiceArrangementHeader({
  arrangement,
  order,
  isStuck = false,
}: ServiceArrangementHeaderProps, ref) {
  const { density } = useSongConfig();

  if (!arrangement) {
    return (
      <div ref={ref} className="sticky top-0 bg-background z-10 flex w-full flex-row justify-between items-center py-2 md:py-2 lg:py-4">
        <Skeleton className="w-1/3 h-12 bg-muted" />
      </div>
    );
  }

  if (!arrangement.song) {
    throw new Error("Arrangement song is not available");
  }

  return (
    <div
      ref={ref}
      className={`sticky top-0 bg-background z-10 flex w-full flex-row justify-between items-center pb-1 ${isStuck ? "border-b border-border" : ""} ${
        density === "compact" ? "pt-2 md:pt-1 lg:pt-2" : "pt-2 md:pt-2 lg:pt-4"
      }`}
    >
      <div className="flex flex-col min-w-0 flex-1 mr-2">
        <Heading level={2} className="truncate">
          <span>{order}. </span>
          {arrangement.song.title}
        </Heading>
      </div>
    </div>
  );
});

export default ServiceArrangementHeader;
