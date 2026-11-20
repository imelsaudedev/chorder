import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GroupDialog from "./GroupDialog";
import TagDialog from "./TagDialog";
import { GroupWithTags, TagWithCount } from "./types";

const tag: TagWithCount = {
  id: 7,
  name: "Natal",
  tagGroupId: 2,
  description: null,
  color: null,
  imageUrl: null,
  _count: { songs: 3 },
};
const group: GroupWithTags = {
  id: 2,
  name: "Ocasião",
  color: "#f9912f",
  description: null,
  presentation: "FILTER",
  selection: "MULTI",
  isProposed: false,
  tags: [tag],
};

describe("GroupDialog", () => {
  it("salva apresentação, seleção e 'em construção'", async () => {
    const onSave = vi.fn().mockResolvedValue(null);
    const onOpenChange = vi.fn();
    render(<GroupDialog group={group} open onOpenChange={onOpenChange} onSave={onSave} />);

    fireEvent.click(screen.getByRole("radio", { name: "Destaque" }));
    fireEvent.click(screen.getByRole("radio", { name: "Uma só" }));
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: "Ocasião",
      presentation: "FEATURED",
      selection: "SINGLE",
      isProposed: true,
    });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("mostra o erro do servidor e não fecha", async () => {
    const onSave = vi.fn().mockResolvedValue("apresentação inválida");
    const onOpenChange = vi.fn();
    render(<GroupDialog group={group} open onOpenChange={onOpenChange} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));
    expect(await screen.findByText("apresentação inválida")).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe("TagDialog", () => {
  it("salva descrição e imagem; cor vazia significa usar a do grupo", async () => {
    const onSave = vi.fn().mockResolvedValue(null);
    render(<TagDialog tag={tag} group={group} open onOpenChange={vi.fn()} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "Tempo de Natal" } });
    fireEvent.change(screen.getByLabelText("Imagem (endereço)"), { target: { value: "https://x.test/n.jpg" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0]).toEqual({
      name: "Natal",
      color: "",
      description: "Tempo de Natal",
      imageUrl: "https://x.test/n.jpg",
    });
  });

  it("não salva com o nome vazio", () => {
    const onSave = vi.fn();
    render(<TagDialog tag={tag} group={group} open onOpenChange={vi.fn()} onSave={onSave} />);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "  " } });
    expect((screen.getByRole("button", { name: /Salvar/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});
