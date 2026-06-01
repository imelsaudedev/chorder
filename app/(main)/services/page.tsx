import LogoHeader from "@/components/common/LogoHeader";
import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { ListMusic } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ClientServicesPage from "./ClientServicesPage";

export default async function ServiceListPage() {
  const t = await getTranslations();

  return (
    <>
      <LogoHeader />

      <div className="flex flex-col grow justify-between gap-4 px-4 sm:px-6 lg:px-8 pt-0 pb-4 sm:pb-6 lg:pb-8">
        <Heading level={1} className="flex items-center gap-2 pt-9">
          <ListMusic className="w-8 lg:w-10 h-8 lg:h-10" />
          {t("Messages.services")}
        </Heading>
      </div>

      <Main>
        <ClientServicesPage />
      </Main>

      <ScrollToTopButton />
    </>
  );
}
