"use server";

import { deleteArrangement } from "@/prisma/data";

export async function deleteArrangementAction(
  songSlug: string,
  arrangementId: number | "default"
) {
  deleteArrangement(songSlug, arrangementId);
}
