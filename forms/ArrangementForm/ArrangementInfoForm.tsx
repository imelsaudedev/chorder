import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { NewSong, RequiredArrangement, SongWith } from '@/models/song';
import { useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ArrangementFormSchema } from './schema';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import MoveArrangementButton from './MoveArrangementButton';
import { RequiredIsNew, SongArrangementWith } from '@/models/song-arrangement';
import { makeArrangementDefault, MoveArrangementAction } from '@/app/songs/[song]/actions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type ArrangementInfoFormProps = {
  song: NewSong;
  form: UseFormReturn<ArrangementFormSchema>;
  moveArrangement: MoveArrangementAction;
};

export default function ArrangementInfoForm({ song, form, moveArrangement }: ArrangementInfoFormProps) {
  const t = useTranslations();
  const arrangement = song.arrangement;

  const router = useRouter();
  const [open, setOpen] = useState(false);

  const hasOtherArrangements = useMemo(
    () => song.arrangements.filter((arrangement) => !arrangement.isDeleted).length > 1,
    [song.arrangements]
  );
  const isDefault = arrangement.isDefault;

  if (arrangement.isNew && !hasOtherArrangements) {
    return null;
  }

  return (
    <div>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex gap-2">
          {t('SongData.arrangementSettings')} {open ? <ChevronUp /> : <ChevronDown />}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex-grow space-y-2">
          {hasOtherArrangements && (
            <FormField
              control={form.control}
              name="arrangementName"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="text-secondary">{t('SongData.arrangementName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={`${t('Messages.arrangement')} ${song.currentArrangementId + 1}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="flex justify-end gap-2">
            {hasOtherArrangements && (
              <Button
                onClick={(event) => {
                  event.preventDefault();
                  makeArrangementDefault(song.slug as string, song.currentArrangementId).then(() => router.refresh());
                }}
                disabled={isDefault}
              >
                {isDefault ? t('SongData.alreadyDefault') : t('SongData.makeDefault')}
              </Button>
            )}
            {!arrangement.isNew && (
              <MoveArrangementButton
                song={song as SongWith<RequiredArrangement<SongArrangementWith<RequiredIsNew>>>}
                moveArrangement={moveArrangement}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
