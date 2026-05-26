import { useMakeArrangementDefault } from "#api-client";
import Heading from "@/components/common/Heading";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Music, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import MoveArrangementButton from "./MoveArrangementButton";

const ACCEPTED_AUDIO_TYPES = ".mp3,.m4a,.aac";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type ArrangementInfoFormProps = {
  arrangementId?: number;
  songSlug?: string;
  isDefault: boolean;
  fieldPrefix?: string;
};
export default function ArrangementInfoForm({
  arrangementId,
  songSlug,
  isDefault,
  fieldPrefix = "",
}: ArrangementInfoFormProps) {
  const { control, setValue, watch } = useFormContext();
  const { makeArrangementDefault } = useMakeArrangementDefault(
    arrangementId || 0
  );
  const handleMakeArrangementDefault = () => {
    makeArrangementDefault();
  };

  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const audioUrl = watch(`${fieldPrefix}audioUrl`) as string | null;

  async function handleAudioFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      setUploadError("Arquivo muito grande. Limite de 5MB.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-audio", { method: "POST", body: formData });
      if (!res.ok) {
        const msg = await res.text();
        setUploadError(msg);
        return;
      }
      const { url } = await res.json();
      setValue(`${fieldPrefix}audioUrl`, url, { shouldDirty: true });
    } catch {
      setUploadError("Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemoveAudio() {
    const url = watch(`${fieldPrefix}audioUrl`);
    if (url) {
      await fetch("/api/upload-audio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }).catch(() => {});
    }
    setValue(`${fieldPrefix}audioUrl`, "", { shouldDirty: true });
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
            onClick={handleMakeArrangementDefault}
            disabled={isDefault}
          >
            {isDefault
              ? t("SongData.alreadyDefault")
              : t("SongData.makeDefault")}
          </Button>

          {arrangementId && (
            <MoveArrangementButton
              arrangementId={arrangementId}
              songSlug={songSlug}
            />
          )}
        </div>
      </div>

      {/* Campos lado a lado a partir de sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <FormField
          control={control}
          name={`${fieldPrefix}name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary mb-2">
                {t("SongData.arrangementName")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={`${t("Messages.arrangement")} ${arrangementId}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${fieldPrefix}key`}
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

        <FormField
          control={control}
          name={`${fieldPrefix}youtubeUrl`}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel className="text-primary mb-2">
                Link YouTube (referência)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo oculto que armazena a URL do áudio no form */}
        <FormField
          control={control}
          name={`${fieldPrefix}audioUrl`}
          render={() => <input type="hidden" />}
        />

        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-primary mb-2">
            Áudio de referência
          </p>
          {audioUrl ? (
            <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
              <Music size={16} className="text-emerald-600 shrink-0" />
              <span className="text-sm truncate flex-1 text-zinc-700">
                Áudio carregado
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-zinc-500 hover:text-red-500"
                onClick={handleRemoveAudio}
              >
                <Trash2 size={14} />
                <span className="sr-only">Remover áudio</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_AUDIO_TYPES}
                className="hidden"
                onChange={handleAudioFileChange}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-fit gap-2"
              >
                <Upload size={14} />
                {isUploading ? "Enviando..." : "Carregar áudio (MP3, M4A, AAC — máx. 5MB)"}
              </Button>
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
