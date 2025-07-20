import Heading from "@/components/common/Heading";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function FeedbackSuccessPage() {
  const t = await getTranslations("Feedback");

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 sm:px-12 lg:px-16">
      <Heading level={1} className="mb-4">
        {t("successTitle")}
      </Heading>
      <p className="text-lg text-center mb-8">{t("successMessage")}</p>
      <Link href="/feedback" className="text-secondary hover:underline">
        {t("submitAnother")}
      </Link>
    </div>
  );
}
