import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [], // No providers needed for route protection middleware
});

export default auth((req) => {
  const { nextUrl } = req;

  // 1. Handle NEXT_LOCALE
  const response = NextResponse.next();
  if (!req.cookies.has("NEXT_LOCALE")) {
    response.cookies.set("NEXT_LOCALE", "pt-BR");
  }

  // 2. Route Protection Logic (first iteration: protect /admin/* routes only)
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = nextUrl.pathname === "/login";
  const isProtectedRoute =
    nextUrl.pathname === "/admin" || nextUrl.pathname.startsWith("/admin/");

  // Check if authenticated or running E2E test with mock session cookie
  const isE2ETestSession =
    (process.env.E2E_TEST === "true" || process.env.NODE_ENV === "test") &&
    req.cookies.has("next-auth.session-token");
  const isLoggedIn = !!req.auth || isE2ETestSession;

  if (isApiAuthRoute) return response;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/services", nextUrl));
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
