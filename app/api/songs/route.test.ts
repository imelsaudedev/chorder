import type { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const roles = vi.hoisted(() => ({ current: [] as UserRole[] }));
const retrieveSongs = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth-guard", () => ({
  getLiveUserAuth: async () => ({ authenticated: roles.current.length > 0, roles: roles.current }),
}));
vi.mock("@/prisma/data", () => ({ retrieveSongs }));

import { GET } from "./route";

const call = (qs = "") => GET(new NextRequest(`http://localhost/api/songs${qs}`));

beforeEach(() => {
  retrieveSongs.mockReset();
  retrieveSongs.mockResolvedValue([{ slug: "a", title: "A", holyricsId: "99" }]);
});

describe("GET /api/songs — o que cada perfil recebe", () => {
  it("visitante: não recebe o uso, mesmo pedindo, nem o id do Holyrics", async () => {
    roles.current = [];
    const data = await (await call("?withUsageStats=true")).json();
    expect(retrieveSongs).toHaveBeenCalledWith(expect.objectContaining({ withUsageStats: false }));
    expect(data[0].holyricsId).toBeNull();
  });

  it("perfil sem permissões (usuário comum): mesmo tratamento do visitante", async () => {
    roles.current = ["USER"];
    await call("?withUsageStats=true");
    expect(retrieveSongs).toHaveBeenCalledWith(expect.objectContaining({ withUsageStats: false }));
  });

  it("Mídia (equipe) recebe o uso, mas não o id do Holyrics", async () => {
    roles.current = ["MEDIA"];
    const data = await (await call("?withUsageStats=true")).json();
    expect(retrieveSongs).toHaveBeenCalledWith(expect.objectContaining({ withUsageStats: true }));
    expect(data[0].holyricsId).toBeNull();
  });

  it("Louvor recebe o uso e o id do Holyrics", async () => {
    roles.current = ["WORSHIP"];
    const data = await (await call("?withUsageStats=true")).json();
    expect(retrieveSongs).toHaveBeenCalledWith(expect.objectContaining({ withUsageStats: true }));
    expect(data[0].holyricsId).toBe("99");
  });

  it("sem pedir o uso, ninguém o recebe", async () => {
    roles.current = ["WORSHIP"];
    await call();
    expect(retrieveSongs).toHaveBeenCalledWith(expect.objectContaining({ withUsageStats: false }));
  });
});
