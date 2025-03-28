import EditHeader from '@/components/EditHeader';
import { MoveArrangementAction, PostSongAction } from '@/app/songs/[song]/actions';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useArrangementForm } from '@/forms/ArrangementForm/useArrangementForm';
import { NewSong } from '@/models/song';
import { useCallback } from 'react';
import { useFieldArray, useFormState } from 'react-hook-form';
import InfoForm from './InfoForm';
import { ArrangementFormSchema } from './schema';
import SongUnitListForm from './SongUnitListForm';
import useArrangementFormFields from './useArrangementFormFields';
import ArrangementInfoForm from './ArrangementInfoForm';

type ArrangementFormPageProps = {
  song: NewSong;
  postSong: PostSongAction;
  moveArrangement: MoveArrangementAction;
};

export default function ArrangementForm({ song, postSong, moveArrangement }: ArrangementFormPageProps) {
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

  async function onSubmit({ title, artist, key, arrangementName, songMap, units, lastUnitId }: ArrangementFormSchema) {
    song.title = title;
    song.artist = artist || null;
    if (key) {
      arrangement.key = key;
    }
    arrangement.name = arrangementName || undefined;
    arrangement.songMap = songMap.map(({ internalId }) => internalId);
    arrangement.units = units;
    arrangement.lastUnitId = lastUnitId;
    await postSong(song);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <EditHeader
          title={arrangement.isNew ? 'Nova música' : 'Editar música'}
          actions={<SaveButtonSet canCancel={!arrangement.isNew} enabled={isDirty && isValid} />}
        />
        <InfoForm form={form} />
        <ArrangementInfoForm song={song} form={form} moveArrangement={moveArrangement} />
        <SongUnitListForm arrangementFormFields={arrangementFormFields} />
      </form>
    </Form>
  );
}
