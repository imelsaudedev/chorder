'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <div className="py-6 sm:py-8 lg:py-10 px-4 sm:px-12 lg:px-16 border-b border-zinc-100">
      <div className="flex justify-start items-center gap-3">
        <Image
          src="/icone_fundo_azul.png"
          alt="IMEL SAÚDE"
          width={50}
          height={50}
          className="h-10 sm:h-12 lg:h-14 w-auto"
          priority
        />
        <div>
          <div className="text-base sm:text-xl font-bold leading-tight tracking-tight  text-stone-900">
            Planejador de cultos
          </div>
          <div className="text-sm leading-tight tracking-tight text-stone-900">IMeL Saúde</div>
        </div>
      </div>
    </div>
  );
}
