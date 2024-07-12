import { useTranslations } from 'next-intl';
import Link from 'next/link';

type HeaderProps = {
  className?: string;
  currentPage: 'songs' | 'services';
};

export default function Header({ className, currentPage }: HeaderProps) {
  const t = useTranslations('Messages');

  const classNames = ['flex', 'bg-primary', 'text-primary-foreground', 'px-4', 'py-4', 'mb-4'];
  if (className) {
    classNames.push(className);
  }

  return (
    <header className={classNames.join(' ')}>
      <div className="flex gap-4">
        <Link href="/" className="font-bold text-lg leading-none">
          CHORDER
        </Link>
        <Link href="/songs" className={pageLinkClassName(currentPage === 'songs')}>
          {t('songs')}
        </Link>
        <Link href="/services" className={pageLinkClassName(currentPage === 'services')}>
          {t('services')}
        </Link>
      </div>
    </header>
  );
}

function pageLinkClassName(isCurrent: boolean) {
  const classNames = ['text-lg', 'leading-none'];
  if (isCurrent) {
    classNames.push('text-secondary');
  }
  return classNames.join(' ');
}
