import { cn } from "@/lib/utils";

export default function Main({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className={cn("mb-12 px-page", className)}>
      {children}
    </main>
  );
}
