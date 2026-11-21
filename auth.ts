import { E2E_SESSION_COOKIE_NAME, isE2ETestMode } from "@/lib/auth-utils";
import prisma from "@/prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import NextAuth, { type Session } from "next-auth";
import { cookies } from "next/headers";
import authConfig from "./auth.config";

const nextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma as unknown as PrismaClient),
  session: { strategy: "jwt" },
  ...authConfig,
});

export const { handlers, signIn, signOut } = nextAuthResult;

export async function auth(): Promise<Session | null> {
  if (isE2ETestMode()) {
    const cookieStore = await cookies();
    if (cookieStore.has(E2E_SESSION_COOKIE_NAME)) {
      return {
        user: {
          id: "test-user-id",
          name: "Test User",
          email: "test@example.com",
          role: "USER",
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  }
  return nextAuthResult.auth();
}
