"use client";

import Text from "@/components/common/Text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ASSIGNABLE_ROLES } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";
import { Eye, Loader2, LogOut, RotateCcw } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserNavViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isRealAdmin?: boolean;
  activeRoles?: UserRole[];
  isPreviewing?: boolean;
  onSignOut?: () => Promise<void>;
  onApplyRolePreview?: (roles: UserRole[] | null) => Promise<void>;
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

function sameRoles(a: readonly UserRole[], b: readonly UserRole[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((r) => setB.has(r));
}

export default function UserNavView({
  user,
  isRealAdmin = false,
  activeRoles = [],
  isPreviewing = false,
  onSignOut,
  onApplyRolePreview,
}: UserNavViewProps) {
  const t = useTranslations("Auth");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(activeRoles);
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
  const initials = getInitials(user.name, user.email);

  useEffect(() => {
    setSelectedRoles(activeRoles);
  }, [activeRoles]);

  const roleLabels: Record<(typeof ASSIGNABLE_ROLES)[number], string> = {
    ADMIN: t("roleAdmin"),
    WORSHIP: t("roleWorship"),
    MEDIA: t("roleMedia"),
  };

  const handleToggleRole = (role: (typeof ASSIGNABLE_ROLES)[number]) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const applyPreview = async (roles: UserRole[] | null) => {
    if (isUpdatingPreview) return;
    setIsUpdatingPreview(true);
    try {
      if (onApplyRolePreview) {
        await onApplyRolePreview(roles);
      } else {
        const res = await fetch("/api/admin/role-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roles }),
        });
        if (!res.ok) throw new Error("Failed to update role preview");
        window.location.reload();
      }
    } catch {
      toast.error(t("rolePreviewError"));
      setIsUpdatingPreview(false);
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      if (onSignOut) {
        await onSignOut();
      } else {
        await signOut({ callbackUrl: "/login" });
      }
    } catch {
      setIsSigningOut(false);
    }
  };

  const hasSelectionChanged = !sameRoles(selectedRoles, activeRoles);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={t("userMenu")}
          className={cn(
            "relative h-10 w-10 rounded-full ring-2 transition-all focus-visible:ring-ring",
            isPreviewing
              ? "ring-warning-border hover:ring-warning-text"
              : "ring-border hover:ring-border-strong"
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? user.email ?? ""}
            />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-display font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isPreviewing && (
            <span
              aria-label={t("rolePreviewActive")}
              title={t("rolePreviewActive")}
              className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border border-background bg-warning-bg text-warning-text shadow-xs"
            >
              <Eye className="size-2.5" aria-hidden="true" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end">
        {(user.name || user.email) && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {user.name && (
                  <Text
                    variant="label"
                    as="p"
                    className="font-semibold leading-none truncate"
                  >
                    {user.name}
                  </Text>
                )}
                {user.email && (
                  <Text
                    variant="caption"
                    size="xs"
                    as="p"
                    className="leading-none truncate"
                  >
                    {user.email}
                  </Text>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {isRealAdmin && (
          <>
            <DropdownMenuLabel className="flex items-center justify-between gap-2 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-3.5" aria-hidden="true" />
                {t("rolePreviewTitle")}
              </span>
              {isPreviewing && (
                <span className="rounded-full bg-warning-bg px-1.5 py-0.5 text-[10px] font-semibold text-warning-text">
                  {t("rolePreviewActive")}
                </span>
              )}
            </DropdownMenuLabel>

            {ASSIGNABLE_ROLES.map((role) => (
              <DropdownMenuCheckboxItem
                key={role}
                checked={selectedRoles.includes(role)}
                disabled={isUpdatingPreview}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => handleToggleRole(role)}
                className="cursor-pointer"
              >
                {roleLabels[role]}
              </DropdownMenuCheckboxItem>
            ))}

            {selectedRoles.length === 0 && (
              <p className="px-2 pb-1 text-[11px] text-muted-foreground">
                {t("rolePreviewUserHint")}
              </p>
            )}

            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 flex-1 text-xs"
                disabled={isUpdatingPreview || (!hasSelectionChanged && isPreviewing)}
                onClick={() => applyPreview(selectedRoles)}
              >
                {isUpdatingPreview ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  t("rolePreviewApply")
                )}
              </Button>
              {isPreviewing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  disabled={isUpdatingPreview}
                  aria-label={t("rolePreviewReset")}
                  title={t("rolePreviewReset")}
                  onClick={() => applyPreview(null)}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          disabled={isSigningOut}
          className="w-full flex items-center text-danger-text focus:bg-danger-subtle focus:text-danger-text transition-colors cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          <span className="font-medium">{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
