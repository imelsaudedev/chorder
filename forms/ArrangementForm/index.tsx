import { PostSongAction } from '@/app/songs/[song]/actions';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useArrangementForm } from '@/forms/ArrangementForm/useArrangementForm';
import { RequiredIsNew, SongArrangementWith } from '@/models/song-arrangement';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { useFieldArray, useFormState } from 'react-hook-form';
import InfoForm from './InfoForm';
import { ArrangementFormSchema } from './schema';
import UnitListForm from './UnitListForm';
import useSongMap from './useSongMap';
import useUnitList from './useUnitList';
import { RequiredArrangement, SongWith } from '@/models/song';

type ArrangementFormPageProps = {
  song: SongWith<RequiredArrangement<SongArrangementWith<RequiredIsNew>>>;
  postSong: PostSongAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ArrangementForm({ song, postSong, setWriteMode }: ArrangementFormPageProps) {
  const arrangement = song.arrangement;

  const form = useArrangementForm(song);
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
    arrangement.key = key;
    arrangement.songMap = form.getValues().songMap.map(({ internalId }) => internalId);
    arrangement.units = units;
    arrangement.lastUnitId = lastUnitId;
    await postSong(song);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 space-y-4">
        <SaveButtonSet
          canCancel={!arrangement.isNew}
          setWriteMode={setWriteMode}
          enabled={(unitsDirty || isDirty) && isValid}
        />
        <InfoForm form={form} />
        <Separator className="" />
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
