import PageTitleBlock from "@/components/common/PageTitleBlock";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import ClientServicesPage from "./ClientServicesPage";
import ServicesPageMenu from "./ServicesPageMenu";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Messages");
  return { title: t("services") };
}

export default async function ServiceListPage() {
  const t = await getTranslations();

  return (
    <>
      <PageTitleBlock title={t("Messages.services")} actions={<ServicesPageMenu />} />

      <Main>
        <ClientServicesPage />
      </Main>

      <ScrollToTopButton />
    </>
  );
}
