import prisma from "@/prisma/client";

// Somente leitura, e só para migração: a configuração agora fica por aparelho (localStorage).
// Devolve apenas o token antigo, usado uma vez como ponto de partida (ver loadHolyricsConfig).
export async function GET() {
  const config = await prisma.holyricsConfig.findUnique({ where: { id: 1 } });
  return Response.json({ token: config?.token ?? "" });
}
