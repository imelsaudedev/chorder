import { Skeleton } from "@/components/ui/skeleton";
import { AddUnitFormSkeleton } from "./AddUnitForm";

export default function ServiceUnitListFormSkeleton() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-2 sm:space-y-4">
      <Skeleton className="flex h-[50px] bg-surface-subtle border border-border" />
      <Skeleton className="flex h-[50px] bg-surface-subtle border border-border" />
      <Skeleton className="flex h-[50px] bg-surface-subtle border border-border" />
      <Skeleton className="flex h-[50px] bg-surface-subtle border border-border" />
      <Skeleton className="flex h-[50px] bg-surface-subtle border border-border" />
      <AddUnitFormSkeleton />
    </section>
  );
}
