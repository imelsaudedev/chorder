import {
  E2E_SESSION_COOKIE_NAME,
  isBootstrapAdminEmail,
  isE2ETestMode,
} from "@/lib/auth-utils";
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
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        if (
          user.id &&
          user.email &&
          user.role !== "ADMIN" &&
          isBootstrapAdminEmail(user.email)
        ) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
          token.role = "ADMIN";
        } else if (user.role) {
          token.role = user.role;
        }
      }
      return token;
    },
  },
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
