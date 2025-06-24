"use server";

import { deleteService } from "@/prisma/data";

export async function deleteServiceAction(slug: string) {
  deleteService(slug);
}
