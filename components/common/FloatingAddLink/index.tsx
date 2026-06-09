import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

type FloatingAddLinkProps = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export default function FloatingAddLink({ label, href, onClick }: FloatingAddLinkProps) {
  const content = (
    <>
      <Plus size={20} className="sm:size-6" />
      <span className="hidden sm:inline">{label}</span>
    </>
  );

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-50">
      {href ? (
        <Button asChild variant="secondary" className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-auto sm:px-6">
          <Link href={href} className="flex items-center justify-center gap-2">
            {content}
          </Link>
        </Button>
      ) : (
        <Button variant="secondary" className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-auto sm:px-6" onClick={onClick}>
          {content}
        </Button>
      )}
    </div>
  );
}
