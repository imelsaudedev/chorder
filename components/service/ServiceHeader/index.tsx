import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { ClientService } from "@/prisma/models";
import { Calendar, MicVocal, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import ServiceActionMenu from "./ServiceActionMenu";
import ServiceConfig from "./ServiceConfig";
import Skeleton from "./Skeleton";

type ServiceHeaderProps = {
  service: ClientService;
};

export default function ServiceHeader({ service }: ServiceHeaderProps) {
  const t = useTranslations();
  const serviceTitle = service?.title?.trim() || t("Service.noTitle");

  if (!service) {
    return <Skeleton />;
  }

  return (
    <Popover>
      <PageHeader
        backLinkHref="/services"
        backLinkText={t("Messages.services")}
        title={serviceTitle}
        subtitle={<Subtitle service={service} />}
        actions={
          <div className="flex gap-2 items-center">
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <SlidersHorizontal />
                <span className="sr-only">{t("Messages.toggleConfig")}</span>
              </Button>
            </PopoverTrigger>
            <ServiceActionMenu service={service} />
          </div>
        }
      />

      <PopoverContent className="w-80" align="end">
        <ServiceConfig />
      </PopoverContent>
    </Popover>
  );
}

type SubtitleProps = { service: ClientService };
function Subtitle({ service }: SubtitleProps) {
  const formattedDate = useFormattedDate(service.date);
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4 leading-tight">
      <span className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        {formattedDate}
      </span>
      {service.worshipLeader && (
        <span className="flex items-center gap-1">
          <MicVocal className="w-4 h-4" />
          <span className="hidden sm:block">{t("Service.ledBy")}</span>
          {service.worshipLeader}
        </span>
      )}
    </div>
  );
}
