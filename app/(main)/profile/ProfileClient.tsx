"use client";

import Text from "@/components/common/Text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";
import { Loader2, Music, Shield, Users, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    roles: UserRole[];
  };
}

function getInitials(name?: string | null, email?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length > 0) {
    return parts
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  const emailTrimmed = email?.trim();
  if (emailTrimmed) {
    return emailTrimmed.slice(0, 2).toUpperCase();
  }
  return "?";
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const t = useTranslations("Profile");
  const router = useRouter();

  const [savedName, setSavedName] = useState<string>(user.name ?? "");
  const [name, setName] = useState<string>(user.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const initials = getInitials(savedName || null, user.email);

  const trimmedInput = name.trim();
  const canSave = trimmedInput.length > 0 && trimmedInput !== savedName.trim();

  const visibleTeamRoles: UserRole[] = [];
  if (user.roles.includes("WORSHIP")) visibleTeamRoles.push("WORSHIP");
  if (user.roles.includes("MEDIA")) visibleTeamRoles.push("MEDIA");
  if (user.roles.includes("ADMIN")) visibleTeamRoles.push("ADMIN");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving || !canSave) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedInput }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data: { name: string | null } = await res.json();
      const nextName = data.name ?? "";
      setSavedName(nextName);
      setName(nextName);
      toast.success(t("nameSaved"));
      router.refresh();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const renderRoleBadge = (role: UserRole) => {
    if (role === "WORSHIP") {
      return (
        <span
          key={role}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
        >
          <Music className="size-3.5" aria-hidden="true" />
          {t("roleWorship")}
        </span>
      );
    }
    if (role === "MEDIA") {
      return (
        <span
          key={role}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
        >
          <Video className="size-3.5" aria-hidden="true" />
          {t("roleMedia")}
        </span>
      );
    }
    if (role === "ADMIN") {
      return (
        <span
          key={role}
          className="inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-3 py-1 text-xs font-medium text-warning-text"
        >
          <Shield className="size-3.5" aria-hidden="true" />
          {t("roleAdmin")}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16 ring-2 ring-border">
            <AvatarImage
              src={user.image ?? undefined}
              alt={savedName || user.email}
            />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-base font-display font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {savedName || t("unnamed")}
            </h2>
            <Text variant="caption" as="p" className="truncate">
              {user.email}
            </Text>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm font-medium text-foreground">{t("rolesTitle")}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {visibleTeamRoles.length > 0 ? (
              visibleTeamRoles.map(renderRoleBadge)
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                )}
              >
                <Users className="size-3.5" aria-hidden="true" />
                {t("roleUser")}
              </span>
            )}
          </div>
          {visibleTeamRoles.length === 0 && (
            <Text variant="caption" size="xs" as="p" className="mt-2">
              {t("noTeamRolesHint")}
            </Text>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("nameLabel")}</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              maxLength={60}
              disabled={isSaving}
              autoComplete="name"
            />
            <Text variant="caption" size="xs" as="p">
              {t("nameHint")}
            </Text>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" disabled={isSaving || !canSave}>
              {isSaving && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              )}
              {t("save")}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
