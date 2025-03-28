'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Home, Music, ListMusic } from 'lucide-react';

type NavbarProps = {
  currentPage: 'songs' | 'services';
};

export default function NavBar({ currentPage }: NavbarProps) {
  const t = useTranslations('Messages');

  return (
    <>
      {/* Sidebar (visível em telas maiores) */}
      <nav className="hidden sm:flex sm:flex-col sm:fixed sm:left-0 sm:top-0 sm:h-full sm:w-20 sm:bg-zinc-50 sm:border-r sm:border-zinc-100">
        <div className="flex flex-col items-center sm:pt-12 lg:pt-16 gap-6">
          <NavItem href="/" icon={<Home size={24} />} label={t('home')} active={false} />
          <NavItem
            href="/services"
            icon={<ListMusic size={24} />}
            label={t('services')}
            active={currentPage === 'services'}
          />
          <NavItem href="/songs" icon={<Music size={24} />} label={t('songs')} active={currentPage === 'songs'} />
        </div>
      </nav>

      {/* Menu inferior fixo (aparece apenas em telas pequenas) */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-gradient-to-t from-white to-white/50 backdrop-blur-lg shadow-md border-t border-gray-100">
        <div className="flex justify-around py-3">
          <NavItem href="/" icon={<Home size={24} />} label={t('home')} active={false} />
          <NavItem
            href="/services"
            icon={<ListMusic size={24} />}
            label={t('services')}
            active={currentPage === 'services'}
          />
          <NavItem href="/songs" icon={<Music size={24} />} label={t('songs')} active={currentPage === 'songs'} />
        </div>
      </nav>
    </>
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
      className={`flex flex-col items-center text-sm ${active ? 'text-secondary font-semibold' : 'text-gray-600'}`}
    >
      {icon}
      <span className="text-xs">{label}</span> {/* Nome do menu só aparece na sidebar */}
    </Link>
  );
}
