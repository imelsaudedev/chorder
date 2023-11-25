import Link from "next/link";
import ExpandingArrow from "../expanding-arrow";

type BackArrowProps = {
  href: string;
};

export default function BackArrow({ href }: BackArrowProps) {
  return (
    <Link href={href} className="flex group mr-6 text-purple-500">
      <ExpandingArrow className="rotate-180 h-6 w-6" />
    </Link>
  );
}
