export type Presentation = "FEATURED" | "SHELF" | "FILTER";
export type Selection = "SINGLE" | "MULTI";

export type TagWithCount = {
  id: number;
  name: string;
  tagGroupId: number;
  description: string | null;
  color: string | null;
  imageUrl: string | null;
  group?: { id: number; name: string; color: string };
  _count: { songs: number };
};

export type GroupWithTags = {
  id: number;
  name: string;
  color: string;
  description: string | null;
  presentation: Presentation;
  selection: Selection;
  isProposed: boolean;
  tags: TagWithCount[];
};

export const PRESENTATION_LABEL: Record<Presentation, string> = {
  FEATURED: "Destaque",
  SHELF: "Prateleira",
  FILTER: "Filtro",
};

export const PRESENTATION_HELP: Record<Presentation, string> = {
  FEATURED: "Cards grandes com imagem, em grade, no topo da home de Músicas.",
  SHELF: "Cards compactos numa linha com rolagem lateral, na home.",
  FILTER: "Não aparece na home; só serve como filtro na lista.",
};

export const SELECTION_LABEL: Record<Selection, string> = {
  SINGLE: "Uma só",
  MULTI: "Várias",
};
