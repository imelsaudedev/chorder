import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type BackLinkProps = {
  href: string;
  text: string;
};

const BackLink = ({ href, text }: BackLinkProps) => (
  <div className="cursor-pointer items-center flex flex-row gap-1 mb-4 text-zinc-400">
    <Link href={href}>
      <div className="flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" strokeWidth={3} />
        <span>{text}</span>
      </div>
    </Link>
  </div>
);

export default BackLink;
