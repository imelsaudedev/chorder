import { Button } from '@/components/ui/button';
import messages from '@/i18n/messages';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <h1 className="pt-4 pb-8 text-primary text-center text-4xl font-medium tracking-tight md:text-7xl">Chorder</h1>
      <div className="flex gap-4">
        <Button asChild variant={'secondary'}>
          <Link href="/songs/">{messages.messages.songs}</Link>
        </Button>
        <Button asChild variant={'secondary'}>
          <Link href="/services/">{messages.messages.services}</Link>
        </Button>
      </div>
    </main>
  );
}
