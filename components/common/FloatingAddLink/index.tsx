import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

type FloatingAddLinkProps = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export default function FloatingAddLink({ label, href, onClick }: FloatingAddLinkProps) {
  const mobile = href
    ? <Button asChild variant="secondary" size="icon" className="shadow-lg rounded-full sm:hidden"><Link href={href}><Plus /></Link></Button>
    : <Button variant="secondary" size="icon" className="shadow-lg rounded-full sm:hidden" onClick={onClick}><Plus /></Button>;

  const desktop = href
    ? <Button asChild variant="secondary" size="lg" className="shadow-lg hidden sm:flex"><Link href={href}><Plus />{label}</Link></Button>
    : <Button variant="secondary" size="lg" className="shadow-lg hidden sm:flex" onClick={onClick}><Plus />{label}</Button>;

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-50">
      {mobile}
      {desktop}
    </div>
  );
}
