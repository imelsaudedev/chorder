import {
  E2E_SESSION_COOKIE_NAME,
  isBootstrapAdminEmail,
  isE2ETestMode,
} from "@/lib/auth-utils";
import prisma from "@/prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient, UserRole } from "@prisma/client";
import NextAuth, { type Session } from "next-auth";
import { cookies } from "next/headers";
import authConfig from "./auth.config";

const nextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma as unknown as PrismaClient),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.id && profile) {
        const googlePicture =
          typeof profile.picture === "string" && profile.picture.trim()
            ? profile.picture.trim()
            : null;
        const googleName =
          typeof profile.name === "string" && profile.name.trim()
            ? profile.name.trim()
            : null;

        const updates: { image?: string; name?: string } = {};
        if (googlePicture && googlePicture !== user.image) {
          updates.image = googlePicture;
        }
        if (googleName && googleName !== user.name) {
          updates.name = googleName;
        }

        if (Object.keys(updates).length > 0) {
          await prisma.user
            .update({ where: { id: user.id }, data: updates })
            .catch(() => {});
          if (updates.image) user.image = updates.image;
          if (updates.name) user.name = updates.name;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        let roles: UserRole[] = Array.isArray(user.roles) ? [...user.roles] : [];
        if (
          user.id &&
          user.email &&
          !roles.includes("ADMIN") &&
          isBootstrapAdminEmail(user.email)
        ) {
          roles = Array.from(new Set([...roles, "ADMIN"]));
          await prisma.user.update({
            where: { id: user.id },
            data: { roles },
          });
        }
        token.roles = roles;
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
          roles: ["ADMIN"],
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  }
  return nextAuthResult.auth();
}
