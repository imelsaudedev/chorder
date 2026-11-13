import { z } from "zod";
import { arrangementSchema } from "./arrangement";
import { songUnitSchema } from "./song-unit";

// O arranjo embutido no item do culto é cópia de leitura de algo que já está salvo
// (o servidor só o usa para copiar blocos ao criar o arranjo do culto). Blocos com
// conteúdo vazio existem em arranjos antigos/importados; a regra de "conteúdo
// obrigatório" vale ao editar uma música, não deve impedir de salvar o culto.
const embeddedArrangementSchema = arrangementSchema
  .innerType()
  .extend({ units: z.array(songUnitSchema.extend({ content: z.string() })).optional() });

export const serviceUnitTypeSchema = z.enum([
  "SONG",
  "FALA",
  "LEITURA",
  "ORACAO",
  "AVISOS",
  "SERMAO",
  "OUTRO",
]);

export const serviceUnitSchema = z.object({
  id: z.number().optional(),
  clientId: z.string(),
  type: serviceUnitTypeSchema,
  semitoneTranspose: z.number().nullable(),
  arrangementId: z.number().nullable(),
  arrangement: embeddedArrangementSchema.optional().nullable(),
  order: z.number().positive(),
  durationMin: z.number().nullable().optional(),
  label: z.string().nullable().optional(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: z.any().nullable().optional(),
});

export type ServiceUnitSchema = z.infer<typeof serviceUnitSchema>;
