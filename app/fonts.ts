import {
  Space_Grotesk,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Serif,
} from "next/font/google";

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

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});
