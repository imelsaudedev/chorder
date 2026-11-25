"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ServiceSharePermission } from "@/prisma/models";
import {
  Check,
  Copy,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type ShareRow = {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  permission: ServiceSharePermission;
};

type ShareServiceDialogProps = {
  serviceSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ShareServiceDialog({
  serviceSlug,
  open,
  onOpenChange,
}: ShareServiceDialogProps) {
  const t = useTranslations("ShareService");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [linkUpdating, setLinkUpdating] = useState(false);
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<ServiceSharePermission>("VIEW");
  const [copied, setCopied] = useState(false);

  const loadShares = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/services/${serviceSlug}/shares`);
      if (!res.ok) throw new Error("Failed to load shares");
      const data = await res.json();
      setShares(data.shares ?? []);
      setShareToken(data.shareToken ?? null);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [serviceSlug, t]);

  useEffect(() => {
    if (open) {
      loadShares();
    }
  }, [open, loadShares]);

  const shareUrl =
    shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/services/${serviceSlug}?share=${shareToken}`
      : null;

  async function handleAddShare(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/services/${serviceSlug}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, permission }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "user_not_found") {
          toast.error(t("userNotFound"));
        } else if (data.error === "cannot_share_with_self") {
          toast.error(t("cannotShareWithSelf"));
        } else {
          toast.error(t("updateError"));
        }
        return;
      }
      setShares(data.shares ?? []);
      setEmail("");
      toast.success(t("personAdded"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangePermission(
    targetEmail: string,
    nextPermission: ServiceSharePermission
  ) {
    try {
      const res = await fetch(`/api/services/${serviceSlug}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, permission: nextPermission }),
      });
      if (!res.ok) throw new Error("Failed to update permission");
      const data = await res.json();
      setShares(data.shares ?? []);
      toast.success(t("permissionUpdated"));
    } catch {
      toast.error(t("updateError"));
    }
  }

  async function handleRemoveShare(userId: string) {
    try {
      const res = await fetch(
        `/api/services/${serviceSlug}/shares?userId=${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove share");
      const data = await res.json();
      setShares(data.shares ?? []);
      toast.success(t("personRemoved"));
    } catch {
      toast.error(t("updateError"));
    }
  }

  async function handleLinkAction(action: "enable" | "disable" | "regenerate") {
    setLinkUpdating(true);
    try {
      const res = await fetch(`/api/services/${serviceSlug}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkSharing: action }),
      });
      if (!res.ok) throw new Error("Failed to update link sharing");
      const data = await res.json();
      setShareToken(data.shareToken ?? null);
      if (action === "regenerate") toast.success(t("linkRegenerated"));
    } catch {
      toast.error(t("updateError"));
    } finally {
      setLinkUpdating(false);
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t("linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {/* Share with specific registered accounts */}
        <form onSubmit={handleAddShare} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={submitting}
          />
          <div className="flex gap-2">
            <select
              aria-label={t("permissionLabel")}
              value={permission}
              onChange={(e) =>
                setPermission(e.target.value as ServiceSharePermission)
              }
              disabled={submitting}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="VIEW">{t("permissionView")}</option>
              <option value="EDIT">{t("permissionEdit")}</option>
            </select>
            <Button type="submit" variant="secondary" disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {t("addPerson")}
            </Button>
          </div>
        </form>

        {/* Shared users list */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("peopleWithAccess")}
          </p>
          {loading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {t("loading")}
            </div>
          ) : shares.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
              {t("noPeopleYet")}
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {shares.map((share) => (
                <li
                  key={share.userId}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {share.name || share.email}
                    </p>
                    {share.name && (
                      <p className="truncate text-xs text-muted-foreground">
                        {share.email}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <select
                      aria-label={t("permissionLabel")}
                      value={share.permission}
                      onChange={(e) =>
                        handleChangePermission(
                          share.email,
                          e.target.value as ServiceSharePermission
                        )
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground"
                    >
                      <option value="VIEW">{t("permissionView")}</option>
                      <option value="EDIT">{t("permissionEdit")}</option>
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      aria-label={t("removePerson")}
                      onClick={() => handleRemoveShare(share.userId)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Anyone with the link (Google Docs style) */}
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Link2 className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("linkSharingTitle")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("linkSharingDescription")}
                </p>
              </div>
            </div>
            <Switch
              checked={Boolean(shareToken)}
              disabled={linkUpdating}
              aria-label={t("linkSharingTitle")}
              onCheckedChange={(checked) =>
                handleLinkAction(checked ? "enable" : "disable")
              }
            />
          </div>

          {shareUrl && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 bg-background text-xs"
              />
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? t("copied") : t("copyLink")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={linkUpdating}
                  aria-label={t("regenerateLink")}
                  title={t("regenerateLink")}
                  onClick={() => handleLinkAction("regenerate")}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
