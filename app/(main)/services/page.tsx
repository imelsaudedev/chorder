import LogoHeader from "@/components/common/LogoHeader";
import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { getTranslations } from "next-intl/server";
import ClientServicesPage from "./ClientServicesPage";

export default async function ServiceListPage() {
  const t = await getTranslations();

  return (
    <>
      <LogoHeader />

      <div className="flex flex-col grow justify-between gap-4 px-5 sm:px-8 lg:px-14 pt-0 pb-4 sm:pb-6 lg:pb-8">
        <Heading level={1} className="pt-9">
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
