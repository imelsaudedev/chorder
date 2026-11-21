import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Defense-in-depth auth guard for admin API route handlers.
 * Returns a 401 JSON response if unauthenticated, or `null` if allowed.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
