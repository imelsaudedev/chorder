import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/prisma/client";
import authConfig from "./auth.config";
import { cookies } from "next/headers";

const nextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma as any),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const { handlers, signIn, signOut } = nextAuthResult;

export const auth = async (...args: any[]) => {
  if (process.env.E2E_TEST === "true" || process.env.NODE_ENV === "test") {
    const cookieStore = await cookies();
    if (cookieStore.has("next-auth.session-token")) {
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
  return (nextAuthResult.auth as any)(...args);
};
