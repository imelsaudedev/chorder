// Única fonte da extração do id de vídeo — reaproveitada tanto pelo player
// quanto por qualquer validação de link, para nunca divergirem (um link que
// passa na validação sempre tem que tocar, e vice-versa).
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /youtube\.com\/embed\/([^?&#]+)/,
    /youtube\.com\/shorts\/([^?&#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
