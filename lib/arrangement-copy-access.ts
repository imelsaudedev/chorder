import type { LiveUserAuth } from "@/lib/auth-guard";
import prisma from "@/prisma/client";
import { retrieveService, retrieveServiceSlugsUsingArrangement } from "@/prisma/data";

/**
 * Quem pode editar uma liturgia pode editar a cópia do arranjo que está nela (só a cifra, e só essa
 * cópia). Vale para uma cópia de liturgia (`isServiceArrangement`) usada por uma liturgia que a pessoa
 * edita: dona, compartilhada com permissão de editar, ou equipe numa liturgia da igreja.
 */
export async function canEditServiceArrangementCopy(
  arrangementId: number,
  live: LiveUserAuth
): Promise<boolean> {
  if (!live.authenticated || !Number.isInteger(arrangementId)) return false;
  const arrangement = await prisma.songArrangement.findUnique({
    where: { id: arrangementId },
    select: { isServiceArrangement: true, isDeleted: true },
  });
  if (!arrangement || !arrangement.isServiceArrangement || arrangement.isDeleted) return false;

  const slugs = await retrieveServiceSlugsUsingArrangement(arrangementId);
  for (const slug of slugs) {
    const service = await retrieveService(slug, { userId: live.userId, roles: live.roles });
    if (service?.canEdit) return true;
  }
  return false;
}
