import { IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono } from "next/font/google";
import { Bricolage_Grotesque } from "next/font/google";

export const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-serif",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque", // Definindo a variável CSS
  weight: ["400", "500", "600", "700"], // Definindo os pesos da fonte
  subsets: ["latin"],
  display: "swap",
});
