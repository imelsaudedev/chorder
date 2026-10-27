"use client";

import { AudioItem, useAudioPlayer } from "@/components/common/AudioPlayer/context";
import { extractYoutubeId } from "@/components/common/YoutubePlayer/extractYoutubeId";
import { useYoutubePlayer } from "@/components/common/YoutubePlayer/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Loader2, Music, Pencil, Play, Plus, Trash2, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

type Audio = { id?: number; url: string; label: string; order: number };

type Props = {
  songId: number;
  originalArrangementId: number | null;
  youtubeUrl: string | null;
  audios: Audio[];
  title?: string;
};

const ACCEPTED_AUDIO_TYPES = ".mp3,.m4a,.aac";
const ALLOWED_AUDIO_MIME = ["audio/mpeg", "audio/mp4", "audio/aac", "audio/x-m4a"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const UNDO_WINDOW_MS = 6000;

type PendingRemoval =
  | { kind: "video"; url: string }
  | { kind: "audio"; audio: Audio };

async function patchYoutubeUrl(arrangementId: number, youtubeUrl: string | null) {
  const res = await fetch(`/api/arrangements/${arrangementId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ youtubeUrl }),
  });
  if (!res.ok) throw new Error("Falha ao salvar");
}

async function deleteAudioBlob(url: string) {
  await fetch("/api/upload-audio", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

export default function ServiceMediaReferences({
  songId,
  originalArrangementId,
  youtubeUrl,
  audios,
  title,
}: Props) {
  const t = useTranslations("ServiceView");
  const { play: playYoutube } = useYoutubePlayer();
  const { play: playAudio, close: closeAudio } = useAudioPlayer();
  const { close: closeYoutube } = useYoutubePlayer();
  const { mutate } = useSWRConfig();

  const [open, setOpen] = useState(false);
  const [arrangementId, setArrangementId] = useState(originalArrangementId);

  const [addingVideo, setAddingVideo] = useState(false);
  const [videoDraft, setVideoDraft] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [savingVideo, setSavingVideo] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingRef = useRef<PendingRemoval | null>(null);
  const [pending, setPendingState] = useState<PendingRemoval | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setPending(value: PendingRemoval | null) {
    pendingRef.current = value;
    setPendingState(value);
  }

  const liveYoutubeUrl = pending?.kind === "video" ? null : youtubeUrl;
  const liveAudios = audios.filter(
    (a) => !(pending?.kind === "audio" && pending.audio.id === a.id)
  );
  const isEmpty = !liveYoutubeUrl && liveAudios.length === 0 && !uploading;

  function revalidate() {
    mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
  }

  async function ensureArrangementId(): Promise<number> {
    if (arrangementId) return arrangementId;
    const res = await fetch(`/api/songs/${songId}/arrangements`, { method: "POST" });
    if (!res.ok) throw new Error("Falha ao criar arranjo");
    const created = await res.json();
    setArrangementId(created.id);
    return created.id;
  }

  function commitPending() {
    const toCommit = pendingRef.current;
    if (!toCommit) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPending(null);
    void (async () => {
      try {
        const id = await ensureArrangementId();
        if (toCommit.kind === "video") {
          await patchYoutubeUrl(id, null);
        } else {
          await fetch(`/api/arrangements/${id}/audios/${toCommit.audio.id}`, { method: "DELETE" });
          await deleteAudioBlob(toCommit.audio.url);
        }
        revalidate();
      } catch {
        toast.error(t("saveError"));
        revalidate();
      }
    })();
  }

  function scheduleRemoval(removal: PendingRemoval, undoMessage: string) {
    commitPending();
    setPending(removal);
    timerRef.current = setTimeout(commitPending, UNDO_WINDOW_MS);
    toast(undoMessage, {
      duration: UNDO_WINDOW_MS,
      action: {
        label: t("mediaUndo"),
        onClick: () => {
          if (timerRef.current) clearTimeout(timerRef.current);
          setPending(null);
        },
      },
    });
  }

  function handleRemoveVideo() {
    if (!liveYoutubeUrl) return;
    scheduleRemoval({ kind: "video", url: liveYoutubeUrl }, t("mediaRemoved"));
  }

  function handleRemoveAudio(audio: Audio) {
    scheduleRemoval({ kind: "audio", audio }, t("mediaRemoved"));
  }

  function startAddVideo() {
    commitPending();
    setVideoDraft("");
    setVideoError(null);
    setAddingVideo(true);
  }

  async function handleSaveVideo() {
    const value = videoDraft.trim();
    if (!value) {
      setVideoError(t("mediaVideoErrorEmpty"));
      return;
    }
    if (!extractYoutubeId(value)) {
      setVideoError(t("mediaVideoErrorInvalid"));
      return;
    }
    setSavingVideo(true);
    try {
      const id = await ensureArrangementId();
      await patchYoutubeUrl(id, value);
      setAddingVideo(false);
      revalidate();
      toast(t("mediaVideoAdded"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSavingVideo(false);
    }
  }

  function handlePlayVideo() {
    if (!liveYoutubeUrl) return;
    closeAudio();
    playYoutube(liveYoutubeUrl, title);
    setOpen(false);
  }

  function handlePlayAudio(audio: Audio) {
    closeYoutube();
    const index = Math.max(0, liveAudios.findIndex((a) => a.id === audio.id));
    playAudio(liveAudios as AudioItem[], title, index);
    setOpen(false);
  }

  function startAddAudio() {
    commitPending();
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    if (!ALLOWED_AUDIO_MIME.includes(file.type)) {
      setUploadError(t("mediaAudioErrorType"));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(t("mediaAudioErrorSize"));
      return;
    }

    setUploading(true);
    try {
      const id = await ensureArrangementId();

      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload-audio", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error(await uploadRes.text());
      const { url } = await uploadRes.json();

      const label = file.name.replace(/\.[^.]+$/, "");
      const addRes = await fetch(`/api/arrangements/${id}/audios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, label }),
      });
      if (!addRes.ok) throw new Error(await addRes.text());

      revalidate();
      toast(t("mediaAudioAdded"));
    } catch {
      setUploadError(t("mediaAudioErrorUpload"));
    } finally {
      setUploading(false);
    }
  }

  function startRename(audio: Audio) {
    setRenamingId(audio.id ?? null);
    setRenameDraft(audio.label);
  }

  async function commitRename(audio: Audio) {
    const label = renameDraft.trim();
    setRenamingId(null);
    if (!label || label === audio.label || !arrangementId) return;
    try {
      await fetch(`/api/arrangements/${arrangementId}/audios/${audio.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      revalidate();
    } catch {
      toast.error(t("saveError"));
    }
  }

  const buttonLabel = isEmpty ? t("mediaButtonLabelEmpty") : t("mediaButtonLabelWithMedia");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={buttonLabel}
          className={`h-10 gap-1.5 ${isEmpty ? "border-dashed text-muted-foreground" : ""}`}
        >
          {isEmpty ? (
            <>
              <Plus size={16} />
              {t("mediaButtonEmpty")}
            </>
          ) : (
            <>
              <Play size={16} className={liveYoutubeUrl ? "text-red-500" : "text-muted-foreground/40"} />
              <Music
                size={16}
                className={liveAudios.length || uploading ? "text-secondary" : "text-muted-foreground/40"}
              />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] max-w-[calc(100vw-2rem)] p-1">
        <div className="flex flex-col gap-0.5">
          {/* Vídeo */}
          {addingVideo ? (
            <div className="flex flex-col gap-1.5 p-2">
              <div className="flex gap-1.5">
                <Input
                  autoFocus
                  className="h-9 text-sm"
                  placeholder={t("mediaVideoPlaceholder")}
                  value={videoDraft}
                  aria-invalid={!!videoError}
                  onChange={(e) => { setVideoDraft(e.target.value); setVideoError(null); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleSaveVideo(); }
                    if (e.key === "Escape") { e.preventDefault(); setAddingVideo(false); }
                  }}
                  disabled={savingVideo}
                />
                <Button type="button" size="icon" className="h-9 w-9 shrink-0" onClick={handleSaveVideo} disabled={savingVideo}>
                  {savingVideo ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setAddingVideo(false)}
                  disabled={savingVideo}
                >
                  <X size={15} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("mediaVideoHint")}</p>
              {videoError && <p className="text-xs text-destructive">{videoError}</p>}
            </div>
          ) : liveYoutubeUrl ? (
            <div className="flex items-center rounded-md hover:bg-accent">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2.5 text-left text-sm"
                onClick={handlePlayVideo}
              >
                <Play size={16} className="shrink-0 text-red-500" />
                <span className="truncate">{t("mediaVideoLabel")}</span>
              </button>
              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive"
                onClick={handleRemoveVideo}
                aria-label={t("mediaRemoveVideo")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="flex min-h-11 items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-accent"
              onClick={startAddVideo}
            >
              <Plus size={16} className="shrink-0" />
              {t("mediaAddVideo")}
            </button>
          )}

          {/* Áudios */}
          {liveAudios.map((audio) => (
            <div key={audio.id} className="flex items-center rounded-md hover:bg-accent">
              {renamingId === audio.id ? (
                <Input
                  autoFocus
                  className="mx-1.5 h-8 flex-1 text-sm"
                  value={renameDraft}
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onBlur={() => commitRename(audio)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); commitRename(audio); }
                    if (e.key === "Escape") { e.preventDefault(); setRenamingId(null); }
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2.5 text-left text-sm"
                  onClick={() => handlePlayAudio(audio)}
                >
                  <Music size={16} className="shrink-0 text-secondary" />
                  <span className="truncate">{audio.label}</span>
                </button>
              )}
              {renamingId !== audio.id && (
                <button
                  type="button"
                  className="flex h-11 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                  onClick={() => startRename(audio)}
                  aria-label={t("mediaRenameAudio")}
                >
                  <Pencil size={14} />
                </button>
              )}
              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveAudio(audio)}
                aria-label={t("mediaRemoveAudio")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {uploading && (
            <div className="flex min-h-11 items-center gap-2.5 px-2.5 py-2 text-sm text-muted-foreground" role="status">
              <Music size={16} className="shrink-0 text-secondary" />
              {t("mediaUploading")}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_AUDIO_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={uploading}
            className="flex min-h-11 items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-accent disabled:opacity-50"
            onClick={startAddAudio}
          >
            <Plus size={16} className="shrink-0" />
            {t("mediaAddAudio")}
          </button>
          {uploadError && <p className="px-2.5 py-1 text-xs text-destructive">{uploadError}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
