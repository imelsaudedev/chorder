import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import { MessageCircleHeartIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import FeedbackForm from "./FeedbackForm";

export default async function FeedbackPage() {
  const t = await getTranslations("Feedback");

  return (
    <>
      <Main className="max-w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-12 lg:px-16 gap-6">
        <Heading level={1} className="flex items-center gap-2">
          <MessageCircleHeartIcon className="w-8 lg:w-10 h-8 lg:h-10" />
          {t("title")}
        </Heading>

        <FeedbackForm />
      </Main>
    </>
  );
}
