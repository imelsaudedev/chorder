import { TagGroupPresentation, TagGroupSelection } from "@prisma/client";

// Padrões decorativos aceitos na capa de uma tag (ver docs/prototipo-musicas).
export const TAG_PATTERNS = ["none", "dots", "waves", "stars", "cross"] as const;

type Parsed<T> = { data: T } | { error: string };

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function optionalText(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("texto inválido");
  return value.trim() === "" ? null : value.trim();
}

function parseWith<T>(read: () => T): Parsed<T> {
  try {
    return { data: read() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "dados inválidos" };
  }
}

// Só devolve as chaves presentes no corpo, para PATCH não apagar o que não foi enviado.
function pick<T extends Record<string, unknown>>(entries: T): Partial<T> {
  return Object.fromEntries(Object.entries(entries).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export type TagGroupFields = {
  description?: string | null;
  presentation?: TagGroupPresentation;
  selection?: TagGroupSelection;
  isProposed?: boolean;
};

export function parseTagGroupFields(body: Record<string, unknown>): Parsed<TagGroupFields> {
  return parseWith(() => {
    const { presentation, selection, isProposed } = body;
    if (presentation !== undefined && !Object.values(TagGroupPresentation).includes(presentation as TagGroupPresentation)) {
      throw new Error("apresentação inválida");
    }
    if (selection !== undefined && !Object.values(TagGroupSelection).includes(selection as TagGroupSelection)) {
      throw new Error("seleção inválida");
    }
    if (isProposed !== undefined && typeof isProposed !== "boolean") throw new Error("isProposed deve ser booleano");
    return pick({
      description: optionalText(body.description),
      presentation: presentation as TagGroupPresentation | undefined,
      selection: selection as TagGroupSelection | undefined,
      isProposed: isProposed as boolean | undefined,
    });
  });
}

export type TagFields = {
  description?: string | null;
  color?: string | null;
  pattern?: string | null;
  imageUrl?: string | null;
};

export function parseTagFields(body: Record<string, unknown>): Parsed<TagFields> {
  return parseWith(() => {
    const color = optionalText(body.color);
    if (color && !HEX_COLOR.test(color)) throw new Error("cor inválida (use #rrggbb)");
    const pattern = optionalText(body.pattern);
    if (pattern && !(TAG_PATTERNS as readonly string[]).includes(pattern)) throw new Error("padrão inválido");
    const imageUrl = optionalText(body.imageUrl);
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) throw new Error("imagem deve ser um endereço http(s)");
    return pick({ description: optionalText(body.description), color, pattern, imageUrl });
  });
}
