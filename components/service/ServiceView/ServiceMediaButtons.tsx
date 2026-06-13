"use client";

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
import { Music, Play, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useSWRConfig } from "swr";

type Audio = { id?: number; url: string; label: string; order: number };

type Props = {
  originalArrangementId: number;
  youtubeUrl: string | null;
  audios: Audio[];
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

export default function ServiceMediaButtons({ originalArrangementId, youtubeUrl, audios }: Props) {
  return (
    <>
      <YoutubeButton
        originalArrangementId={originalArrangementId}
        currentUrl={youtubeUrl}
      />
      <AudioButton
        originalArrangementId={originalArrangementId}
        currentAudios={audios}
      />
    </>
  );
}

// ─── YouTube ──────────────────────────────────────────────────────────────────

function YoutubeButton({
  originalArrangementId,
  currentUrl,
}: {
  originalArrangementId: number;
  currentUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(currentUrl ?? "");
  const [saving, setSaving] = useState(false);
  const { mutate } = useSWRConfig();

  const hasUrl = Boolean(currentUrl);

  function handleOpen(isOpen: boolean) {
    if (isOpen) setDraft(currentUrl ?? "");
    setOpen(isOpen);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await patchArrangementMedia(originalArrangementId, { youtubeUrl: draft.trim() || null });
      mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await patchArrangementMedia(originalArrangementId, { youtubeUrl: null });
      mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={`h-8 w-8 md:size-9 ${hasUrl ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100" : ""}`}
        onClick={() => setOpen(true)}
        title="YouTube"
      >
        <Play size={15} className={hasUrl ? "text-red-500" : "text-zinc-400"} />
      </Button>
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
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleRemove}
              disabled={saving}
            >
              Remover
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Áudio ────────────────────────────────────────────────────────────────────

function AudioButton({
  originalArrangementId,
  currentAudios,
}: {
  originalArrangementId: number;
  currentAudios: Audio[];
}) {
  const [open, setOpen] = useState(false);
  const [audios, setAudios] = useState<Audio[]>(currentAudios);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate } = useSWRConfig();

  const hasAudios = audios.length > 0;

  function handleOpen(isOpen: boolean) {
    if (isOpen) setAudios(currentAudios);
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

  async function handleRemove(index: number) {
    const audio = audios[index];
    if (audio?.url) {
      await fetch("/api/upload-audio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: audio.url }),
      }).catch(() => {});
    }
    setAudios((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await patchArrangementMedia(originalArrangementId, { audios });
      mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={`h-8 w-8 md:size-9 ${hasAudios ? "border-secondary/30 text-secondary bg-secondary/10 hover:bg-secondary/20" : ""}`}
        onClick={() => setOpen(true)}
        title={`Áudio${hasAudios ? ` (${audios.length})` : ""}`}
      >
        <Music size={15} className={hasAudios ? "text-secondary" : "text-zinc-400"} />
      </Button>
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
