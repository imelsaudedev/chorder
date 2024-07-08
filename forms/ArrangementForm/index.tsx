import { PostSongAction } from '@/app/songs/[song]/actions';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useArrangementForm } from '@/forms/ArrangementForm/useArrangementForm';
import { NewSong } from '@/models/song';
import { Dispatch, SetStateAction, useCallback } from 'react';
import { useFieldArray, useFormState } from 'react-hook-form';
import InfoForm from './InfoForm';
import { ArrangementFormSchema } from './schema';
import SongUnitListForm from './SongUnitListForm';
import useArrangementFormFields from './useArrangementFormFields';

type ArrangementFormPageProps = {
  song: NewSong;
  postSong: PostSongAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ArrangementForm({ song, postSong, setWriteMode }: ArrangementFormPageProps) {
  const arrangement = song.arrangement;

  const form = useArrangementForm(song);
  const { isDirty, isValid } = useFormState({ control: form.control });
  const {
    fields: units,
    append: appendSongUnit,
    remove: removeSongUnit,
    update: updateSongUnit,
  } = useFieldArray({
    control: form.control,
    name: 'units',
  });
  const {
    fields: songMap,
    append: appendSongMapElement,
    remove: removeSongMapElement,
    swap: swapSongMapElements,
  } = useFieldArray({
    control: form.control,
    name: 'songMap',
  });
  const lastUnitId = form.getValues('lastUnitId');
  const setLastUnitId = useCallback((newLastUnitId: number) => form.setValue('lastUnitId', newLastUnitId), [form]);
  const arrangementFormFields = useArrangementFormFields(
    units,
    appendSongUnit,
    removeSongUnit,
    updateSongUnit,
    songMap,
    appendSongMapElement,
    removeSongMapElement,
    swapSongMapElements,
    lastUnitId,
    setLastUnitId
  );

  async function onSubmit({ title, artist, key, songMap, units, lastUnitId }: ArrangementFormSchema) {
    song.title = title;
    song.artist = artist || null;
    if (key) {
      arrangement.key = key;
    }
    arrangement.songMap = songMap.map(({ internalId }) => internalId);
    arrangement.units = units;
    arrangement.lastUnitId = lastUnitId;
    await postSong(song);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 space-y-4">
        <SaveButtonSet canCancel={!arrangement.isNew} setWriteMode={setWriteMode} enabled={isDirty && isValid} />
        <InfoForm form={form} />
        <Separator />
        <SongUnitListForm arrangementFormFields={arrangementFormFields} />
      </form>
    </Form>
  );
}
