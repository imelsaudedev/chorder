import {
  spaceGrotesk,
  ibmPlexMono,
  ibmPlexSans,
  ibmPlexSerif,
} from "@/app/fonts";
import { AudioPlayerProvider } from "@/components/common/AudioPlayer/context";
import AudioPlayerWidget from "@/components/common/AudioPlayer/Widget";
import { SongMetaModalProvider } from "@/components/song/SongMetaModal/context";
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
    title: {
      template: `%s | ${t("siteName")}`,
      default: t("siteName"),
    },
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
        className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable} ${spaceGrotesk.variable} font-sans`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider
          messages={messages}
          timeZone="America/Sao_Paulo"
        >
          <YoutubePlayerProvider>
            <AudioPlayerProvider>
              <SongMetaModalProvider>
                {children}
              </SongMetaModalProvider>
              <YoutubePlayerWidget />
              <AudioPlayerWidget />
            </AudioPlayerProvider>
          </YoutubePlayerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
