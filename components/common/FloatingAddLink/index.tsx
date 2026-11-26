"use client";

import { Button } from "@/components/ui/button";
import { useMediaBarOpen } from "@/hooks/useMediaBarOpen";
import { Plus } from "lucide-react";
import Link from "next/link";

type FloatingAddLinkProps = {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Só o botão redondo do celular (a ação já existe no cabeçalho em telas maiores). */
  mobileOnly?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export default function FloatingAddLink({
  label,
  href,
  onClick,
  mobileOnly = false,
  disabled = false,
  disabledReason,
}: FloatingAddLinkProps) {
  const mediaBarOpen = useMediaBarOpen();

  const mobile =
    href && !disabled ? (
      <Button asChild variant="secondary" size="icon" className="shadow-lg rounded-full sm:hidden">
        <Link href={href}>
          <Plus />
        </Link>
      </Button>
    ) : (
      <Button
        variant="secondary"
        size="icon"
        className="shadow-lg rounded-full sm:hidden"
        onClick={onClick}
        disabled={disabled}
        title={disabled ? disabledReason : label}
        aria-label={label}
      >
        <Plus />
      </Button>
    );

  const desktop =
    href && !disabled ? (
      <Button asChild variant="secondary" size="lg" className="shadow-lg hidden sm:flex">
        <Link href={href}>
          <Plus />
          {label}
        </Link>
      </Button>
    ) : (
      <Button
        variant="secondary"
        size="lg"
        className="shadow-lg hidden sm:flex"
        onClick={onClick}
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
      >
        <Plus />
        {label}
      </Button>
    );

  return (
    <div
      className={`fixed right-4 sm:right-8 z-50 transition-[bottom] ${
        mediaBarOpen ? "bottom-44 sm:bottom-28" : "bottom-24 sm:bottom-8"
      }`}
    >
      {mobile}
      {!mobileOnly && desktop}
    </div>
  );
}
