import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSafeCallbackUrl,
  isBootstrapAdminEmail,
  isE2ETestMode,
  parseAdminEmails,
} from "./auth-utils";

describe("getSafeCallbackUrl", () => {
  it("allows safe relative paths with query strings and hashes", () => {
    expect(getSafeCallbackUrl("/admin/tags")).toBe("/admin/tags");
    expect(getSafeCallbackUrl("/services?page=2#top")).toBe(
      "/services?page=2#top"
    );
  });

  it("rejects absolute external URLs", () => {
    expect(getSafeCallbackUrl("https://evil.example/phish")).toBe("/services");
    expect(getSafeCallbackUrl("http://evil.example")).toBe("/services");
    expect(getSafeCallbackUrl("javascript:alert(1)")).toBe("/services");
  });

  it("rejects protocol-relative and backslash open-redirect vectors", () => {
    expect(getSafeCallbackUrl("//evil.example")).toBe("/services");
    expect(getSafeCallbackUrl("/\\evil.example")).toBe("/services");
  });

  it("falls back when empty or nullish", () => {
    expect(getSafeCallbackUrl(undefined)).toBe("/services");
    expect(getSafeCallbackUrl(null)).toBe("/services");
    expect(getSafeCallbackUrl("")).toBe("/services");
    expect(getSafeCallbackUrl("", "/custom")).toBe("/custom");
  });
});

describe("isE2ETestMode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true only when E2E_TEST=true outside production and Vercel", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("E2E_TEST", "true");
    vi.stubEnv("VERCEL", "");
    expect(isE2ETestMode()).toBe(true);
  });

  it("returns false in production even if E2E_TEST=true", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("E2E_TEST", "true");
    vi.stubEnv("VERCEL", "");
    expect(isE2ETestMode()).toBe(false);
  });

  it("returns false on Vercel even if E2E_TEST=true", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("E2E_TEST", "true");
    vi.stubEnv("VERCEL", "1");
    expect(isE2ETestMode()).toBe(false);
  });
});

describe("parseAdminEmails / isBootstrapAdminEmail", () => {
  it("parses comma-separated emails with whitespace and mixed case", () => {
    const parsed = parseAdminEmails(
      " Andrew.Kurauchi@gmail.com , tiagodacosta01@gmail.com , "
    );
    expect(parsed.has("andrew.kurauchi@gmail.com")).toBe(true);
    expect(parsed.has("tiagodacosta01@gmail.com")).toBe(true);
    expect(parsed.size).toBe(2);
  });

  it("matches bootstrap admin emails case-insensitively", () => {
    const env = "andrew.kurauchi@gmail.com,tiagodacosta01@gmail.com";
    expect(isBootstrapAdminEmail("ANDREW.KURAUCHI@GMAIL.COM", env)).toBe(true);
    expect(isBootstrapAdminEmail("tiagodacosta01@gmail.com", env)).toBe(true);
    expect(isBootstrapAdminEmail("other@gmail.com", env)).toBe(false);
    expect(isBootstrapAdminEmail(null, env)).toBe(false);
    expect(isBootstrapAdminEmail("andrew.kurauchi@gmail.com", "")).toBe(false);
  });
});
