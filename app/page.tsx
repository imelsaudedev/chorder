import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  const t = useTranslations('Messages');
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 text-primary text-center text-4xl font-medium tracking-tight md:text-7xl">IMeL Saúde</h1>
      <div className="flex gap-4">
        <Button asChild variant={'secondary'}>
          <Link href="/services/">{t('services')}</Link>
        </Button>
        <Button asChild variant={'secondary'}>
          <Link href="/songs/">{t('songs')}</Link>
        </Button>
      </div>
    </main>
  );
}
