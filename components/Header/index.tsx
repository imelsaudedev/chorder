'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

type HeaderProps = {
  className?: string;
  currentPage: 'songs' | 'services';
};

export default function Header({ className, currentPage }: HeaderProps) {
  const t = useTranslations('Messages');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar o menu de hambúrguer

  const classNames = [
    'bg-slate-50',
    'text-primary-foreground',
    'px-4 sm:px-6 lg:px-8',
    'py-4 sm:py-6',
    'mb-8 sm:mb-12',
  ];
  if (className) {
    classNames.push(className);
  }

  return (
    <header className={`${classNames.join(' ')} fullscreen-hidden`}>
      <div className="flex justify-start items-center gap-6">
        {/* Nome (lado esquerdo) */}
        <Link href="/" className="font-bold text-lg text-primary leading-none">
          IMEL SAÚDE
        </Link>

        {/* Menu de Hambúrguer (telas pequenas) */}
        <button className="sm:hidden text-primary focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        {/* Links de Navegação (telas maiores) */}
        <div className="hidden sm:flex gap-4">
          <Link href="/services" className={pageLinkClassName(currentPage === 'services')}>
            {t('services')}
          </Link>
          <Link href="/songs" className={pageLinkClassName(currentPage === 'songs')}>
            {t('songs')}
          </Link>
        </div>
      </div>

      {/* Menu de Hambúrguer (telas pequenas - conteúdo) */}
      {isMenuOpen && (
        <div className="sm:hidden text-right mt-4">
          <Link href="/songs" className={`block ${pageLinkClassName(currentPage === 'songs')} mb-2`}>
            {t('songs')}
          </Link>
          <Link href="/services" className={`block ${pageLinkClassName(currentPage === 'services')}`}>
            {t('services')}
          </Link>
        </div>
      )}
    </header>
  );
}

function pageLinkClassName(isCurrent: boolean) {
  const classNames = ['text-base sm:text-lg', 'text-primary', 'leading-none'];
  if (isCurrent) {
    classNames.push('text-secondary');
  }
  return classNames.join(' ');
}
