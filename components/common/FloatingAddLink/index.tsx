import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type FloatingAddLinkProps = {
  href: string;
  label: string;
};
export default function FloatingAddLink({ href, label }: FloatingAddLinkProps) {
  return (
    <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8">
      <Button
        asChild
        variant="secondary"
        className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-12 sm:px-6"
      >
        <Link href={href} className="flex items-center justify-center gap-2">
          <Plus className="size-5 sm:size-6" />
          <span className="hidden sm:inline">{label}</span>
        </Link>
      </Button>
    </div>
  );
}
