import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildViewer, useViewer, ViewerProvider } from "./ViewerProvider";

describe("buildViewer", () => {
  it("visitante: nada, mesmo que cheguem perfis", () => {
    const v = buildViewer(false, ["ADMIN"]);
    expect(v).toMatchObject({ authenticated: false, isAdmin: false, canEditSongs: false, canViewChurchServices: false, canSeeUsageStats: false });
    expect(v.roles).toEqual([]);
  });

  it("usuário comum logado: sem edição, sem cultos da igreja, sem uso", () => {
    expect(buildViewer(true, [])).toMatchObject({ authenticated: true, canEditSongs: false, canViewChurchServices: false, canSeeUsageStats: false });
  });

  it("Mídia: vê cultos e uso, não edita músicas", () => {
    expect(buildViewer(true, ["MEDIA"])).toMatchObject({ canEditSongs: false, canViewChurchServices: true, canSeeUsageStats: true, isAdmin: false });
  });

  it("Louvor edita músicas; Admin faz tudo", () => {
    expect(buildViewer(true, ["WORSHIP"])).toMatchObject({ canEditSongs: true, canSeeUsageStats: true, isAdmin: false });
    expect(buildViewer(true, ["ADMIN"])).toMatchObject({ canEditSongs: true, canSeeUsageStats: true, isAdmin: true });
  });

  it("perfis combinados (Mídia e Louvor)", () => {
    expect(buildViewer(true, ["MEDIA", "WORSHIP"])).toMatchObject({ canEditSongs: true, canViewChurchServices: true });
  });
});

describe("ViewerProvider / useViewer", () => {
  it("sem provedor, vale o visitante", () => {
    const { result } = renderHook(() => useViewer());
    expect(result.current.canEditSongs).toBe(false);
    expect(result.current.authenticated).toBe(false);
  });

  it("entrega as permissões dos perfis recebidos", () => {
    function Probe() {
      const v = useViewer();
      return <span>{v.canEditSongs ? "edita" : "não edita"}</span>;
    }
    render(
      <ViewerProvider authenticated roles={["WORSHIP"]}>
        <Probe />
      </ViewerProvider>
    );
    expect(screen.getByText("edita")).toBeInTheDocument();
  });
});
