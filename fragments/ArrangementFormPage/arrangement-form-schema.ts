import { z } from 'zod';

// TODO: Translate error messages
const arrangementFormSchema = z.object({
  title: z.string().min(2),
  artist: z.string().optional(),
  key: z.string().optional(),
  unitMap: z
    .array(
      z.object({
        internalId: z.number(),
      })
    )
    .nonempty(),
});

export default arrangementFormSchema;
export type ArrangementFormSchema = z.infer<typeof arrangementFormSchema>;
export type UnitMapElementSchema = z.infer<typeof arrangementFormSchema>['unitMap'][0];
