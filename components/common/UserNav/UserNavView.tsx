"use client";

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
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface UserNavViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut?: () => Promise<void>;
}

export default function UserNavView({ user, onSignOut }: UserNavViewProps) {
  const t = useTranslations("Auth");
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.slice(0, 2).toUpperCase();

  const handleSignOut = () => {
    if (onSignOut) {
      void onSignOut();
    } else {
      void signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full ring-2 ring-border hover:ring-border-strong transition-all focus-visible:ring-ring"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-display font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">
              {user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
          <User className="mr-2 h-4 w-4" />
          <span>{t("profile")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
          <Settings className="mr-2 h-4 w-4" />
          <span>{t("settings")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="w-full flex items-center text-danger-text focus:bg-danger-subtle focus:text-danger-text transition-colors cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
