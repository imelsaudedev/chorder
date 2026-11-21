import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSafeCallbackUrl,
  isAdminRoute,
  isE2ETestMode,
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

describe("isAdminRoute", () => {
  it("matches /admin and nested /admin/* routes", () => {
    expect(isAdminRoute("/admin")).toBe(true);
    expect(isAdminRoute("/admin/tags")).toBe(true);
    expect(isAdminRoute("/admin/templates/123")).toBe(true);
  });

  it("does not match non-admin routes or prefix collisions", () => {
    expect(isAdminRoute("/services")).toBe(false);
    expect(isAdminRoute("/songs")).toBe(false);
    expect(isAdminRoute("/administrator")).toBe(false);
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
