import { PostSongAction } from '@/app/songs/[song]/actions';
import Main from '@/components/Main';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Form } from '@/components/ui/form';
import { Song } from '@/models/song';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { z } from 'zod';
import ArrangementForm from './ArrangementForm';
import InfoForm from './InfoForm';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  title: z.string().min(2),
  artist: z.string().optional(),
  key: z.string().optional(),
});

type ArrangementFormPageProps = {
  song: Song;
  postSong: PostSongAction;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ArrangementFormPage({ song, postSong, setWriteMode }: ArrangementFormPageProps) {
  const arrangement = song.getOrCreateCurrentArrangement();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: song.title,
      artist: song.artist || '',
      key: arrangement.key,
    },
  });
  const { isValid } = useFormState({ control: form.control });

  async function onSubmit({ title, artist, key }: z.infer<typeof formSchema>) {
    song.title = title;
    song.artist = artist || null;
    if (key) arrangement.key = key;
    await postSong(song.serialize());
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col-reverse md:flex-row px-4 gap-4">
          <InfoForm song={song} form={form} />
          <SaveButtonSet canCancel={!arrangement.isNew} setWriteMode={setWriteMode} enabled={isValid} />
        </div>
        <Separator className="my-4" />
        <Main>
          <ArrangementForm arrangement={arrangement} />
        </Main>
      </form>
    </Form>
  );
}
