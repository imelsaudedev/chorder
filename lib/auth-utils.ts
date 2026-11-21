export const E2E_SESSION_COOKIE_NAME = "next-auth.session-token";

/**
 * Only allows E2E mock-cookie auth outside production and outside Vercel.
 * Checking `process.env.NODE_ENV !== "production"` allows Next.js to
 * dead-code-eliminate the branch in production builds.
 */
export function isE2ETestMode(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    !process.env.VERCEL &&
    process.env.E2E_TEST === "true"
  );
}

/**
 * Returns a safe, same-origin relative path for post-login redirects.
 * Rejects protocol-relative URLs (`//evil.com`), backslashes (`/\evil.com`),
 * and absolute external URLs (`https://evil.com`).
 */
export function getSafeCallbackUrl(
  rawUrl?: string | null,
  fallback = "/services"
): string {
  if (
    !rawUrl ||
    !rawUrl.startsWith("/") ||
    rawUrl.startsWith("//") ||
    rawUrl.startsWith("/\\")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(rawUrl, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Parses a comma-separated list of bootstrap admin emails (e.g. from ADMIN_EMAILS)
 * into a normalized lowercase Set.
 */
export function parseAdminEmails(raw?: string | null): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Returns true if the given email is configured as a bootstrap admin via ADMIN_EMAILS.
 */
export function isBootstrapAdminEmail(
  email?: string | null,
  rawEnv: string | undefined = process.env.ADMIN_EMAILS
): boolean {
  if (!email) return false;
  return parseAdminEmails(rawEnv).has(email.trim().toLowerCase());
}
