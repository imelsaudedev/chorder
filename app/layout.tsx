import {
  bricolageGrotesque,
  ibmPlexMono,
  ibmPlexSans,
  ibmPlexSerif,
} from "@/app/fonts";
import { YoutubePlayerProvider } from "@/components/common/YoutubePlayer/context";
import YoutubePlayerWidget from "@/components/common/YoutubePlayer/Widget";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("siteDescription"),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="en">
      <head></head>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable} ${bricolageGrotesque.variable} font-sans pb-4 md:pb-6 lg:pb-8`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider
          messages={messages}
          timeZone="America/Sao_Paulo"
        >
          <YoutubePlayerProvider>
            {children}
            <YoutubePlayerWidget />
          </YoutubePlayerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
