import { Skeleton } from "@/components/ui/skeleton";
import { Fragment } from "react";
import InitialsNav from "./InitialsNav";

const SKELETON_GROUPS = [
  ["w-1/2", "w-1/3", "w-4/5", "w-2/3"],
  ["w-1/3", "w-1/4", "w-3/4"],
  ["w-2/3", "w-1/2", "w-5/6", "w-1/3"],
];

export default function SongListSkeleton() {
  return (
    <>
      <InitialsNav existingInitials={[]} />
      <section>
        {SKELETON_GROUPS.map((widths, groupIdx) => (
          <Fragment key={`group-${groupIdx}`}>
            {/* Letter divider */}
            <div className="flex items-center gap-3 pt-5 pb-1">
              <Skeleton className="w-3 h-3 rounded" />
              <Skeleton className="flex-1 h-px" />
            </div>
            {/* Song rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
              {widths.map((titleWidth, idx) => (
                <div
                  key={`row-${idx}`}
                  className="flex items-start gap-2 border-b border-zinc-100 py-3"
                >
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className={`h-4 ${titleWidth} bg-zinc-200`} />
                    <Skeleton className="h-3 w-1/4 bg-zinc-100" />
                    <Skeleton className="h-3 w-3/5 bg-zinc-100" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded shrink-0 bg-zinc-100" />
                </div>
              ))}
            </div>
          </Fragment>
        ))}
      </section>
    </>
  );
}
