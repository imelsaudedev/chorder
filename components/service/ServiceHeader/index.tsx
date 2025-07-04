import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import { ClientService } from "@/prisma/models";
import { Calendar, MicVocal, Settings2 } from "lucide-react";
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
    <Collapsible>
      <PageHeader
        backLinkHref="/services"
        backLinkText={t("Messages.services")}
        title={serviceTitle}
        subtitle={<Subtitle service={service} />}
        actions={
          <div className="flex gap-2 items-center md:self-end">
            <ServiceActionMenu service={service} />
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 />
                <span className="sr-only">{t("Messages.toggleConfig")}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        }
      />

      <CollapsibleContent>
        <ServiceConfig />
      </CollapsibleContent>
    </Collapsible>
  );
}

type SubtitleProps = { service: ClientService };
function Subtitle({ service }: SubtitleProps) {
  const formattedDate = useFormattedDate(service.date);
  const t = useTranslations();

  return (
    <div className="flex flex-row items-center gap-4 leading-tight">
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
