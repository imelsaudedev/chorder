import localFont from "next/font/local";

// Fontes locais (subconjunto latin, que cobre o português): o build não depende mais de buscar
// nada no Google Fonts, que já derrubou deploys na Vercel (TypeError em `next/font`).
// Arquivos em `app/fonts/`, baixados do Google Fonts (licença OFL).

export const ibmPlexSans = localFont({
  variable: "--font-ibm-sans",
  // Fonte variável: um arquivo cobre de 400 a 700.
  src: [{ path: "./fonts/ibm-plex-sans-latin-variable.woff2", weight: "400 700", style: "normal" }],
  display: "swap",
});

export const ibmPlexSerif = localFont({
  variable: "--font-ibm-serif",
  src: [
    { path: "./fonts/ibm-plex-serif-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-serif-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-serif-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-serif-latin-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const ibmPlexMono = localFont({
  variable: "--font-ibm-mono",
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const spaceGrotesk = localFont({
  variable: "--font-space-grotesk",
  src: [{ path: "./fonts/space-grotesk-latin-600.woff2", weight: "600", style: "normal" }],
  display: "swap",
});
