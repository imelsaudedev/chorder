import { PostSongAction } from '@/app/songs/[song]/actions';
import Main from '@/components/Main';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Form } from '@/components/ui/form';
import { Song } from '@/models/song';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { z } from 'zod';
import UnitListForm from './UnitListForm';
import InfoForm from './InfoForm';
import { Separator } from '@/components/ui/separator';
import arrangementFormSchema, { ArrangementFormSchema } from './arrangement-form-schema';

type ArrangementFormPageProps = {
  song: Song;
  postSong: PostSongAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ArrangementFormPage({ song, postSong, setWriteMode }: ArrangementFormPageProps) {
  const arrangement = song.getOrCreateCurrentArrangement();
  const [units, setUnits] = useState(arrangement.units);
  const [lastUnitId, setLastUnitId] = useState(arrangement.lastUnitId);

  const form = useForm<ArrangementFormSchema>({
    resolver: zodResolver(arrangementFormSchema),
    defaultValues: {
      title: song.title,
      artist: song.artist || '',
      key: arrangement.key,
      unitMap: arrangement.songMap.map((internalId) => ({ internalId })),
    },
  });
  const { isDirty, isValid } = useFormState({ control: form.control });
  const [unitsDirty, setUnitsDirty] = useState(false);
  const setUnitsToDirty = useCallback(() => setUnitsDirty(true), []);

  async function onSubmit({ title, artist, key }: z.infer<typeof arrangementFormSchema>) {
    song.title = title;
    song.artist = artist || null;
    if (key) arrangement.key = key;
    arrangement.forceSetSongMap(form.getValues().unitMap.map(({ internalId }) => internalId));
    arrangement.forceSetUnits(units);
    arrangement.lastUnitId = lastUnitId;
    console.log(song.serialize());
    await postSong(song.serialize());
  }

  return (
    <Main>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col-reverse md:flex-row px-4 gap-4">
            <InfoForm form={form} />
            <SaveButtonSet
              canCancel={!arrangement.isNew}
              setWriteMode={setWriteMode}
              enabled={(unitsDirty || isDirty) && isValid}
            />
          </div>
          <Separator className="my-4" />
          <UnitListForm
            form={form}
            arrangement={arrangement}
            units={units}
            setUnits={setUnits}
            setUnitsToDirty={setUnitsToDirty}
            lastUnitId={lastUnitId}
            setLastUnitId={setLastUnitId}
          />
        </form>
      </Form>
    </Main>
  );
}
