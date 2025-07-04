import FloatingAddLink from "@/components/common/FloatingAddLink";
import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import ServiceList from "@/components/service/ServiceList";
import { retrieveServices } from "@/prisma/data";
import { ListMusic } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function ServiceListPage() {
  const t = await getTranslations();
  const services = await retrieveServices();

  return (
    <>
      <div className="flex flex-col grow justify-between gap-4 px-4 sm:px-12 lg:px-16 pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 lg:pb-8">
        <Heading level={1} className="flex items-center gap-2">
          <ListMusic className="w-8 lg:w-10 h-8 lg:h-10" />
          {t("Messages.services")}
        </Heading>
      </div>

      <Main>
        <ServiceList services={services} />
      </Main>

      <FloatingAddLink href="./services/new" label={t("Messages.newService")} />
      <ScrollToTopButton />
    </>
  );
}
