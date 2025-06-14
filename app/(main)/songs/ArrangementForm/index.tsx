"use client";

import { Form } from "@/components/ui/form";
import {
  ClientSong,
  SongArrangementWithSong,
  SongArrangementWithUnits,
} from "@/prisma/models";
import EditHeader from "@components/EditHeader";
import SaveButtonSet from "@components/SaveButtonSet";
import { useForm } from "react-hook-form";
import { saveSongAction } from "./actions";
import ArrangementInfoForm from "./ArrangementInfoForm";
import { ArrangementFormSchema } from "./schema";
import SongInfoForm from "./SongInfoForm";
import SongUnitListForm from "./SongUnitListForm";
import { initForm } from "./useArrangementForm";
import { usePathname, useSearchParams } from "next/navigation";

type ArrangementFormProps = {
  song?: ClientSong;
  arrangement?: SongArrangementWithUnits;
  onSaved?: (arrangement: SongArrangementWithSong) => void;
};

export default function ArrangementForm({
  song,
  arrangement,
  onSaved,
}: ArrangementFormProps) {
  const form = useForm<ArrangementFormSchema>(initForm(song, arrangement));
  const { isDirty, isValid } = form.formState;
  const searchParams = useSearchParams().toString();
  const pathname = usePathname().replace("/edit", "");
  const cancelUrl = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

  async function onSubmit({
    title,
    artist,
    arrangementId,
    arrangementName,
    key,
    units,
  }: ArrangementFormSchema) {
    const arrangement = await saveSongAction(
      title,
      artist,
      arrangementId,
      arrangementName,
      key,
      units
    );
    if (onSaved) {
      onSaved(arrangement);
    }
  }
  const isNew = !arrangement?.id;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <EditHeader
          title={isNew ? "Nova música" : "Editar música"}
          actions={
            <SaveButtonSet
              cancelUrl={isNew ? undefined : cancelUrl}
              enabled={isDirty && isValid}
            />
          }
        />
        <SongInfoForm />
        <ArrangementInfoForm
          songSlug={song?.slug}
          arrangementId={arrangement?.id}
          isDefault={arrangement?.isDefault ?? true}
        />
        <SongUnitListForm />
      </form>
    </Form>
  );
}
