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
      <Button asChild variant="secondary" className="shadow-lg rounded-full">
        <Link href={href} className="flex items-center gap-1 sm:pr-6">
          <Plus />
          <span className="hidden sm:inline">{label}</span>
        </Link>
      </Button>
    </div>
  );
}
