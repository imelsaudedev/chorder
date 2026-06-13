import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import ClientServicesPage from "./ClientServicesPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Messages");
  return { title: t("services") };
}

export default async function ServiceListPage() {
  const t = await getTranslations();

  return (
    <>
      <div className="px-5 sm:px-8 lg:px-14 pt-6 sm:pt-8 pb-4 sm:pb-6 lg:pb-8">
        <Heading level={1}>
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
