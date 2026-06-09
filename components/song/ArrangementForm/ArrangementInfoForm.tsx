"use client";

import IncreaseDecreaseButtonSet from "@/components/common/IncreaseDecreaseButtonSet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Music, Play, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

const CHROMATIC_KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ACCEPTED_AUDIO_TYPES = ".mp3,.m4a,.aac";
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type ArrangementInfoFormProps = {
  arrangementId?: number;
  fieldPrefix?: string;
};

export default function ArrangementInfoForm({
  arrangementId,
  fieldPrefix = "",
}: ArrangementInfoFormProps) {
  const { control } = useFormContext();
  const t = useTranslations();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-zinc-50 border-b border-zinc-200">

      {/* Nome · Tom · | · YouTube · Áudio */}
      <div className="flex flex-wrap gap-3 items-end justify-start">

        {/* Nome */}
        <FormField
          control={control}
          name={`${fieldPrefix}name`}
          render={({ field }) => (
            <FormItem className="w-56 shrink-0">
              <FormLabel className="text-primary">
                {t("SongData.arrangementName")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Arranjo principal"
                  autoFocus={!field.value}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tom */}
        <KeyField fieldPrefix={fieldPrefix} />

        {/* YouTube + Áudio */}
        <div className="flex gap-3 items-end">
          <YoutubeField fieldPrefix={fieldPrefix} arrangementId={arrangementId} />
          <AudioField fieldPrefix={fieldPrefix} />
        </div>

      </div>
    </div>
  );
}

/* ─── Tom ─────────────────────────────────────────────────────────────── */

function KeyField({ fieldPrefix }: { fieldPrefix: string }) {
  const { watch, setValue } = useFormContext();
  const t = useTranslations();
  const currentKey = (watch(`${fieldPrefix}key`) as string) || "C";
  const idx = CHROMATIC_KEYS.indexOf(currentKey);
  const safeIdx = idx === -1 ? 0 : idx;

  const handleIncrease = () => {
    setValue(`${fieldPrefix}key`, CHROMATIC_KEYS[(safeIdx + 1) % CHROMATIC_KEYS.length], { shouldDirty: true });
  };

  const handleDecrease = () => {
    setValue(`${fieldPrefix}key`, CHROMATIC_KEYS[(safeIdx - 1 + CHROMATIC_KEYS.length) % CHROMATIC_KEYS.length], { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <span className="text-sm font-medium text-primary leading-none">
        {t("SongData.defaultKey")}
      </span>
      <IncreaseDecreaseButtonSet
        stringValue={currentKey}
        setStringValue={(v) => setValue(`${fieldPrefix}key`, v, { shouldDirty: true })}
        increase={handleIncrease}
        decrease={handleDecrease}
        decreaseLabel="♭"
        increaseLabel="♯"
      />
    </div>
  );
}

/* ─── YouTube ─────────────────────────────────────────────────────────── */

function YoutubeField({ fieldPrefix, arrangementId }: { fieldPrefix: string; arrangementId?: number }) {
  const { watch, setValue } = useFormContext();
  const t = useTranslations();
  const youtubeUrl = (watch(`${fieldPrefix}youtubeUrl`) as string) || "";
  const [draft, setDraft] = useState(youtubeUrl);
  const [open, setOpen] = useState(false);

  const hasUrl = Boolean(youtubeUrl);

  function handleOpen(isOpen: boolean) {
    if (isOpen) setDraft(youtubeUrl);
    setOpen(isOpen);
  }

  function handleSave() {
    setValue(`${fieldPrefix}youtubeUrl`, draft.trim(), { shouldDirty: true });
    setOpen(false);
  }

  function handleRemove() {
    setValue(`${fieldPrefix}youtubeUrl`, "", { shouldDirty: true });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={`gap-2 ${hasUrl ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100" : ""}`}
        >
          <Play size={15} className={hasUrl ? "text-red-500" : "text-zinc-400"} />
          YouTube
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Referência YouTube</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="https://youtube.com/watch?v=..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }}
          autoFocus
        />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          {hasUrl && (
            <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleRemove}>
              Remover
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("Messages.cancel")}
            </Button>
            <Button type="button" onClick={handleSave}>
              {t("Messages.save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Áudio ───────────────────────────────────────────────────────────── */

function AudioField({ fieldPrefix }: { fieldPrefix: string }) {
  const { control, setValue } = useFormContext();
  const t = useTranslations();
  const { fields, append, remove } = useFieldArray({ control, name: `${fieldPrefix}audios` });
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasAudios = fields.length > 0;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) { setUploadError("Máx. 10MB."); return; }
    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-audio", { method: "POST", body: formData });
      if (!res.ok) { setUploadError(await res.text()); return; }
      const { url } = await res.json();
      const defaultLabel = file.name.replace(/\.[^.]+$/, "");
      append({ url, label: defaultLabel, order: fields.length });
    } catch {
      setUploadError("Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove(index: number) {
    const audio = fields[index] as any;
    if (audio?.url) {
      await fetch("/api/upload-audio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: audio.url }),
      }).catch(() => {});
    }
    remove(index);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={`gap-2 ${hasAudios ? "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100" : ""}`}
        >
          <Music size={15} className={hasAudios ? "text-emerald-600" : "text-zinc-400"} />
          Áudio{hasAudios ? ` (${fields.length})` : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Áudios de referência</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {fields.length > 0 && (
            <div className="flex flex-col gap-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Music size={14} className="text-emerald-600 shrink-0" />
                  <Input
                    className="h-8 text-sm"
                    defaultValue={(field as any).label}
                    onChange={(e) =>
                      setValue(`${fieldPrefix}audios.${idx}.label`, e.target.value, { shouldDirty: true })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_AUDIO_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 w-fit"
          >
            <Upload size={14} />
            {isUploading ? "Enviando…" : "Adicionar áudio (MP3, M4A, AAC — máx. 10MB)"}
          </Button>
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="ml-auto" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
