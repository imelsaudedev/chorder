import { PostSongAction } from '@/app/songs/[song]/actions';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useArrangementForm } from '@/forms/ArrangementForm/useArrangementForm';
import { Song } from '@/models/song';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { useFieldArray, useFormState } from 'react-hook-form';
import InfoForm from './InfoForm';
import { ArrangementFormSchema } from './schema';
import UnitListForm from './UnitListForm';
import useSongMap from './useSongMap';
import useUnitList from './useUnitList';

type ArrangementFormPageProps = {
  song: Song;
  postSong: PostSongAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ArrangementForm({ song, postSong, setWriteMode }: ArrangementFormPageProps) {
  const arrangement = useMemo(() => song.getOrCreateCurrentArrangement(), [song]);

  const form = useArrangementForm(song, arrangement);
  const { isDirty, isValid } = useFormState({ control: form.control });
  const songMapFieldArray = useFieldArray({ control: form.control, name: 'songMap' });
  const appendToSongMap = useCallback(
    (unitId: number) => songMapFieldArray.append({ internalId: unitId }),
    [songMapFieldArray]
  );

  const unitListHook = useUnitList(arrangement.units, arrangement.lastUnitId, appendToSongMap);
  const { units, lastUnitId, isDirty: unitsDirty } = unitListHook;
  const songMapHook = useSongMap(unitListHook.internalId2Unit, songMapFieldArray, unitListHook.onDeleteUnit);

  async function onSubmit({ title, artist, key }: ArrangementFormSchema) {
    song.title = title;
    song.artist = artist || null;
    if (key) arrangement.key = key;
    arrangement.forceSetSongMap(form.getValues().songMap.map(({ internalId }) => internalId));
    arrangement.forceSetUnits(units);
    arrangement.lastUnitId = lastUnitId;
    await postSong(song.serialize());
  }

  return (
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
          songMapFields={songMapFieldArray.fields}
          arrangement={arrangement}
          unitListHook={unitListHook}
          songMapHook={songMapHook}
        />
      </form>
    </Form>
  );
}
