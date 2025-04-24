import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NewSong, RequiredArrangement, SongWith } from "@/models/song";
import { useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ArrangementFormSchema } from "./schema";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import MoveArrangementButton from "./MoveArrangementButton";
import { RequiredIsNew, SongArrangementWith } from "@/models/song-arrangement";
import {
  makeArrangementDefault,
  MoveArrangementAction,
} from "@/app/(main)/songs/[song]/actions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Heading from "@/app/lib/components/Heading";

type ArrangementInfoFormProps = {
  song: NewSong;
  form: UseFormReturn<ArrangementFormSchema>;
  moveArrangement: MoveArrangementAction;
};

export default function ArrangementInfoForm({
  song,
  form,
  moveArrangement,
}: ArrangementInfoFormProps) {
  const t = useTranslations();
  const arrangement = song.arrangement;

  const router = useRouter();

  const hasOtherArrangements = useMemo(
    () =>
      song.arrangements.filter((arrangement) => !arrangement.isDeleted).length >
      1,
    [song.arrangements]
  );
  const isDefault = arrangement.isDefault;

  if (arrangement.isNew && !hasOtherArrangements) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 bg-zinc-50">
      {/* Heading + Botões abaixo no mobile, à direita no sm */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <Heading level={2}>{t("SongData.arrangementSettings")}</Heading>

        {/* Botões alinhados à esquerda no mobile e à direita no sm */}
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:justify-end">
          <Button
            variant="outline"
            onClick={(event) => {
              event.preventDefault();
              makeArrangementDefault(
                song.slug as string,
                song.currentArrangementId
              ).then(() => router.refresh());
            }}
            disabled={isDefault}
          >
            {isDefault
              ? t("SongData.alreadyDefault")
              : t("SongData.makeDefault")}
          </Button>

          {!arrangement.isNew && (
            <MoveArrangementButton
              song={
                song as SongWith<
                  RequiredArrangement<SongArrangementWith<RequiredIsNew>>
                >
              }
              moveArrangement={moveArrangement}
            />
          )}
        </div>
      </div>

      {/* Campos lado a lado a partir de sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <FormField
          control={form.control}
          name="arrangementName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary mb-2">
                {t("SongData.arrangementName")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={`${t("Messages.arrangement")} ${
                    song.currentArrangementId + 1
                  }`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary mb-2">
                {t("SongData.defaultKey")}
              </FormLabel>
              <FormControl>
                <Input placeholder={t("SongData.keyPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
