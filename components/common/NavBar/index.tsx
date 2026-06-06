"use client";

import { ListMusic, Music } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const t = useTranslations("Messages");
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const currentPage = pathParts[1];
  const isEditPage = pathname.includes("/edit") || pathname.endsWith("/new");

  if (isEditPage) return null;

  return (
    <nav className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-20 lg:bg-zinc-50 lg:border-r lg:border-zinc-100">
      <div className="flex flex-col items-center pt-16 gap-6">
        <NavItem
          href="/services"
          icon={<ListMusic size={24} />}
          label={t("services")}
          active={currentPage === "services"}
        />
        <NavItem
          href="/songs"
          icon={<Music size={24} />}
          label={t("songs")}
          active={currentPage === "songs"}
        />
      </div>
    </nav>
  );
}

type NavItemProps = {
  href: string;
  icon: JSX.Element;
  label: string;
  active: boolean;
};

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center text-sm ${
        active ? "text-secondary font-semibold" : "text-gray-600"
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>{" "}
      {/* Nome do menu só aparece na sidebar */}
    </Link>
  );
}
