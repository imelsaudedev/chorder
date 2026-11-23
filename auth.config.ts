import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

/**
 * Edge-compatible shared callbacks and pages used by both `auth.ts` and `middleware.ts`.
 */
export const authSharedConfig = {
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.roles = Array.isArray(token.roles) ? token.roles : [];
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.roles = Array.isArray(user.roles) ? user.roles : [];
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
