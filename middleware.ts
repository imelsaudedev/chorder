import { authSharedConfig } from "@/auth.config";
import {
  E2E_SESSION_COOKIE_NAME,
  getSafeCallbackUrl,
  isAdminRoute,
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

  // 2. Route Protection Logic (first iteration: protect /admin/* pages only)
  const isAuthRoute = nextUrl.pathname === "/login";
  const isProtectedRoute = isAdminRoute(nextUrl.pathname);

  const isE2ETestSession =
    isE2ETestMode() && req.cookies.has(E2E_SESSION_COOKIE_NAME);
  const isLoggedIn = !!req.auth || isE2ETestSession;

  if (isAuthRoute) {
    if (isLoggedIn) {
      const target = getSafeCallbackUrl(nextUrl.searchParams.get("callbackUrl"));
      return NextResponse.redirect(new URL(target, nextUrl));
    }
    return response;
  }

  if (!isLoggedIn && isProtectedRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  return response;
});

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
