import { z } from 'zod';

const schema = z.object({
  title: z.string().min(2),
  artist: z.string().optional(),
  key: z.string().optional(),
  songMap: z
    .array(
      z.object({
        internalId: z.number(),
      })
    )
    .nonempty(),
});

export default schema;
export type ArrangementFormSchema = z.infer<typeof schema>;
export type SongMapElementSchema = z.infer<typeof schema>['songMap'][0];
