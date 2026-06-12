import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type BackLinkProps = {
  href: string;
  text: string;
};

const BackLink = ({ href, text }: BackLinkProps) => (
  <Link href={href} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm">
    <ArrowLeft size={14} strokeWidth={2.5} />
    <span>{text}</span>
  </Link>
);

export default BackLink;
