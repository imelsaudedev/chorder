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

function requiresAuthentication(pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname === "/services" || pathname.startsWith("/services/")) return true;
  if (pathname === "/songs/new") return true;
  if (/^\/songs\/[^/]+\/edit$/.test(pathname)) return true;
  return false;
}

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

  // 2. Auth routing (fine-grained role enforcement runs in Server Components & API guards)
  const isAuthRoute = nextUrl.pathname === "/login";
  const isE2ETestSession =
    isE2ETestMode() && req.cookies.has(E2E_SESSION_COOKIE_NAME);
  const isLoggedIn = !!req.auth || isE2ETestSession;

  if (isAuthRoute && isLoggedIn) {
    const target = getSafeCallbackUrl(nextUrl.searchParams.get("callbackUrl"));
    return NextResponse.redirect(new URL(target, nextUrl));
  }

  if (!isLoggedIn && requiresAuthentication(nextUrl.pathname)) {
    const callbackUrl = nextUrl.search
      ? `${nextUrl.pathname}${nextUrl.search}`
      : nextUrl.pathname;
    return NextResponse.redirect(
      new URL(
        `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        nextUrl
      )
    );
  }

  return response;
});

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
