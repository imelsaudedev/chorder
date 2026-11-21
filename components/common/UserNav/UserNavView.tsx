"use client";

import Text from "@/components/common/Text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface UserNavViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut?: () => Promise<void>;
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

export default function UserNavView({ user, onSignOut }: UserNavViewProps) {
  const t = useTranslations("Auth");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initials = getInitials(user.name, user.email);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label={t("userMenu")}
          className="relative h-10 w-10 rounded-full ring-2 ring-border hover:ring-border-strong transition-all focus-visible:ring-ring"
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
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
