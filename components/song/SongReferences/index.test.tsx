import { AudioPlayerProvider, useAudioPlayer } from "@/components/common/AudioPlayer/context";
import { YoutubePlayerProvider, useYoutubePlayer } from "@/components/common/YoutubePlayer/context";
import { ClientArrangement } from "@/prisma/models";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SongReferences, { buildReferenceGroups } from "./index";

vi.mock("@/components/common/YoutubePlayer/useYoutubeTitle", () => ({
  useYoutubeTitle: (url: string | null) => (url ? "Título do vídeo" : null),
}));

const arr = (
  id: number,
  name: string | null,
  youtubeUrl: string | null,
  audios: string[] = [],
  extra: Partial<ClientArrangement> = {}
): ClientArrangement =>
  ({
    id,
    songId: 1,
    name,
    key: "G",
    isDefault: id === 1,
    isDeleted: false,
    isServiceArrangement: false,
    originalArrangementId: null,
    youtubeUrl,
    audios: audios.map((label, order) => ({ url: `/${label}.mp3`, label, order })),
    ...extra,
  }) as ClientArrangement;

function Probe() {
  const y = useYoutubePlayer();
  const a = useAudioPlayer();
  return (
    <output data-testid="probe">
      {JSON.stringify({ yt: y.isOpen ? y.arrangementId : null, au: a.isOpen ? [a.arrangementId, a.currentIndex] : null })}
    </output>
  );
}

function setup(arrangements: ClientArrangement[]) {
  return render(
    <AudioPlayerProvider>
      <YoutubePlayerProvider>
        <SongReferences arrangements={arrangements} title="Música" />
        <Probe />
      </YoutubePlayerProvider>
    </AudioPlayerProvider>
  );
}
const probe = () => JSON.parse(screen.getByTestId("probe").textContent!);

describe("buildReferenceGroups", () => {
  it("só traz arranjos com mídia e ignora cópias de liturgia e apagados", () => {
    const groups = buildReferenceGroups([
      arr(1, null, "https://youtu.be/a"),
      arr(2, "Sem mídia", null),
      arr(3, "Cópia", "https://youtu.be/b", [], { isServiceArrangement: true }),
      arr(4, "Apagado", "https://youtu.be/c", [], { isDeleted: true }),
      arr(5, "Tom em G", null, ["Versão"]),
    ]);
    expect(groups.map((g) => g.label)).toEqual(["Arranjo 1", "Tom em G"]);
  });

  it("nomeia o arranjo único como principal", () => {
    expect(buildReferenceGroups([arr(1, null, "https://youtu.be/a")])[0].label).toBe("Arranjo principal");
  });
});

describe("SongReferences", () => {
  it("não aparece sem nenhuma referência", () => {
    setup([arr(1, null, null)]);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("com uma só referência de vídeo, toca direto", async () => {
    const user = userEvent.setup();
    setup([arr(1, null, "https://youtu.be/a")]);
    await user.click(screen.getByRole("button", { name: "Ouvir referência" }));
    expect(probe().yt).toBe(1);
  });

  it("com uma só referência de áudio, toca direto", async () => {
    const user = userEvent.setup();
    setup([arr(1, null, null, ["Ensaio"])]);
    await user.click(screen.getByRole("button", { name: "Ouvir referência" }));
    expect(probe().au).toEqual([1, 0]);
  });

  it("com várias, abre a lista (plana quando só um arranjo tem mídia)", async () => {
    const user = userEvent.setup();
    setup([arr(1, null, "https://youtu.be/a", ["Ensaio", "Playback"])]);
    await user.click(screen.getByRole("button", { name: "Referências" }));
    expect(screen.getByText("Título do vídeo")).toBeInTheDocument();
    expect(screen.getByText("Ensaio")).toBeInTheDocument();
    expect(screen.getByText("Playback")).toBeInTheDocument();
    expect(screen.queryByText("Arranjo principal")).not.toBeInTheDocument();

    await user.click(screen.getByText("Playback"));
    expect(probe().au).toEqual([1, 1]);
  });

  it("agrupa pelo nome do arranjo quando mais de um tem mídia", async () => {
    const user = userEvent.setup();
    setup([arr(1, "Principal", "https://youtu.be/a"), arr(2, "Tom em G", null, ["Versão em G"])]);
    await user.click(screen.getByRole("button", { name: "Referências" }));
    expect(screen.getByText("Principal")).toBeInTheDocument();
    expect(screen.getByText("Tom em G")).toBeInTheDocument();

    await user.click(screen.getByText("Versão em G"));
    expect(probe().au).toEqual([2, 0]);
  });
});
