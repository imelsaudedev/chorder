import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

/**
 * Edge-compatible shared callbacks and pages used by both `auth.ts` and `middleware.ts`.
 */
export const authSharedConfig = {
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        if (token.role) {
          session.user.role = token.role;
        }
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies Partial<NextAuthConfig>;

/**
 * Full Edge-compatible Auth.js configuration including OAuth and Email providers.
 */
const authConfig = {
  ...authSharedConfig,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      from: process.env.AUTH_RESEND_FROM ?? "onboarding@resend.dev",
    }),
  ],
} satisfies NextAuthConfig;

export default authConfig;
