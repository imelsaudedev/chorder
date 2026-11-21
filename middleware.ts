import { authSharedConfig } from "@/auth.config";
import {
  E2E_SESSION_COOKIE_NAME,
  getSafeCallbackUrl,
  isE2ETestMode,
} from "@/lib/auth-utils";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth({
  ...authSharedConfig,
  secret: process.env.AUTH_SECRET,
  providers: [], // No providers needed in Edge middleware
});

export default auth((req) => {
  const { nextUrl } = req;

  // 1. Handle NEXT_LOCALE
  const response = NextResponse.next();
  if (!req.cookies.has("NEXT_LOCALE")) {
    response.cookies.set("NEXT_LOCALE", "pt-BR", {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  // 2. First iteration: no pages are auth-gated yet; only redirect
  // already-authenticated users away from /login.
  const isAuthRoute = nextUrl.pathname === "/login";
  const isE2ETestSession =
    isE2ETestMode() && req.cookies.has(E2E_SESSION_COOKIE_NAME);
  const isLoggedIn = !!req.auth || isE2ETestSession;

  if (isAuthRoute && isLoggedIn) {
    const target = getSafeCallbackUrl(nextUrl.searchParams.get("callbackUrl"));
    return NextResponse.redirect(new URL(target, nextUrl));
  }

  return response;
});

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
