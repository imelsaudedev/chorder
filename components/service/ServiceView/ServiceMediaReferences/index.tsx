"use client";

import { AudioItem, useAudioPlayer } from "@/components/common/AudioPlayer/context";
import { useYoutubePlayer } from "@/components/common/YoutubePlayer/context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { upload } from "@vercel/blob/client";
import { Check, Music, Pencil, Play, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useSWRConfig } from "swr";

type Audio = { id?: number; url: string; label: string; order: number };

type Props = {
  originalArrangementId: number;
  youtubeUrl: string | null;
  audios: Audio[];
  title?: string;
};

const ACCEPTED_AUDIO_TYPES = ".mp3,.m4a,.aac";
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

async function patchArrangementMedia(
  arrangementId: number,
  data: { youtubeUrl?: string | null; audios?: Audio[] }
) {
  const res = await fetch(`/api/arrangements/${arrangementId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Falha ao salvar");
}

// Referências de vídeo/áudio são "ao vivo": sempre lidas e gravadas no
// arranjo original, nunca na cópia da liturgia. Por isso vivem fora do modo
// de edição de cifra — gerenciar aqui nunca afeta o que está sendo editado.
export default function ServiceMediaReferences({
  originalArrangementId,
  youtubeUrl,
  audios,
  title,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-2">
      <YoutubeChip originalArrangementId={originalArrangementId} currentUrl={youtubeUrl} title={title} />
      <AudioChip originalArrangementId={originalArrangementId} currentAudios={audios} title={title} />
    </div>
  );
}

// ─── Vídeo ──────────────────────────────────────────────────────────────────

function YoutubeChip({
  originalArrangementId,
  currentUrl,
  title,
}: {
  originalArrangementId: number;
  currentUrl: string | null;
  title?: string;
}) {
  const { play } = useYoutubePlayer();
  const { close: closeAudio } = useAudioPlayer();
  const { mutate } = useSWRConfig();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(currentUrl ?? "");
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setDraft(currentUrl ?? "");
    setIsEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await patchArrangementMedia(originalArrangementId, { youtubeUrl: draft.trim() || null });
      mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await patchArrangementMedia(originalArrangementId, { youtubeUrl: null });
      mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          className="h-8 w-56 text-sm"
          placeholder="https://youtube.com/watch?v=..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleSave(); }
            if (e.key === "Escape") { e.preventDefault(); setIsEditing(false); }
          }}
          disabled={saving}
        />
        <Button
          type="button"
          size="icon"
          className="h-8 w-8"
          onClick={handleSave}
          disabled={saving}
          aria-label="Salvar vídeo de referência"
        >
          <Check size={14} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsEditing(false)}
          disabled={saving}
          aria-label="Cancelar"
        >
          <X size={14} />
        </Button>
      </div>
    );
  }

  if (!currentUrl) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-muted-foreground"
        onClick={startEdit}
      >
        <Plus size={14} />
        Vídeo de referência
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 pl-1 pr-1 h-8">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 gap-1.5 px-1.5 text-red-600 hover:bg-red-100 hover:text-red-700"
        onClick={() => { closeAudio(); play(currentUrl, title); }}
      >
        <Play size={14} />
        Vídeo de referência
      </Button>
      <button
        type="button"
        onClick={startEdit}
        className="text-red-400 hover:text-red-600 p-1"
        aria-label="Editar vídeo de referência"
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        onClick={handleRemove}
        disabled={saving}
        className="text-red-400 hover:text-red-600 p-1"
        aria-label="Remover vídeo de referência"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Áudio ────────────────────────────────────────────────────────────────────

function AudioChip({
  originalArrangementId,
  currentAudios,
  title,
}: {
  originalArrangementId: number;
  currentAudios: Audio[];
  title?: string;
}) {
  const { play } = useAudioPlayer();
  const { close: closeYoutube } = useYoutubePlayer();
  const [open, setOpen] = useState(false);
  const [audios, setAudios] = useState<Audio[]>(currentAudios);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useSWRConfig();
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);

  const hasAudios = currentAudios.length > 0;

  function handleOpen(isOpen: boolean) {
    if (isOpen) {
      setAudios(currentAudios);
      setPendingDeletes([]);
    }
    setOpen(isOpen);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) { setUploadError("Máx. 10MB."); return; }
    setUploadError(null);
    setIsUploading(true);
    try {
      const blob = await upload(`audio/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload-audio",
      });
      const defaultLabel = file.name.replace(/\.[^.]+$/, "");
      setAudios((prev) => [...prev, { url: blob.url, label: defaultLabel, order: prev.length }]);
    } catch {
      setUploadError("Erro ao enviar arquivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemoveItem(index: number) {
    const audio = audios[index];
    if (audio?.url) setPendingDeletes((prev) => [...prev, audio.url]);
    setAudios((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await patchArrangementMedia(originalArrangementId, { audios });
      await Promise.all(
        pendingDeletes.map((url) =>
          fetch("/api/upload-audio", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          }).catch(() => {})
        )
      );
      mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      {hasAudios ? (
        <div className="flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/10 pl-1 pr-1 h-8">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 gap-1.5 px-1.5 text-secondary hover:bg-secondary/20"
            onClick={() => { closeYoutube(); play(currentAudios as AudioItem[], title); }}
          >
            <Music size={14} />
            Áudio de referência ({currentAudios.length})
          </Button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-secondary/70 hover:text-secondary p-1"
            aria-label="Gerenciar áudios de referência"
          >
            <Pencil size={13} />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <Plus size={14} />
          Áudio de referência
        </Button>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Áudios de referência</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {audios.length > 0 && (
            <div className="flex flex-col gap-2">
              {audios.map((audio, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Music size={14} className="text-secondary shrink-0" />
                  <Input
                    className="h-8 text-sm"
                    defaultValue={audio.label}
                    onChange={(e) =>
                      setAudios((prev) =>
                        prev.map((a, i) => i === idx ? { ...a, label: e.target.value } : a)
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
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
        <DialogFooter className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || isUploading}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
