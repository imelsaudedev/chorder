import { Skeleton } from "@/components/ui/skeleton";
import { Fragment } from "react";
import InitialsNav from "./InitialsNav";

const SKELETON_GROUPS = [
  ["w-2/5", "w-1/3", "w-1/2"],
  ["w-1/2", "w-2/5", "w-1/3", "w-3/5"],
  ["w-1/3", "w-2/5"],
];

export default function SongListSkeleton() {
  return (
    <>
      <InitialsNav existingInitials={[]} />
      <section>
        {SKELETON_GROUPS.map((widths, groupIdx) => (
          <Fragment key={`group-${groupIdx}`}>
            {/* Divider de letra */}
            <div className="flex items-center gap-3 pt-5 pb-1">
              <Skeleton className="w-3 h-3 rounded" />
              <Skeleton className="flex-1 h-px" />
            </div>
            {/* Linhas de música */}
            {widths.map((titleWidth, idx) => (
              <div
                key={`row-${idx}`}
                className="flex items-center gap-3 py-3 px-1 border-b border-zinc-100"
              >
                <div className="flex-1 space-y-1.5">
                  <Skeleton className={`h-4 ${titleWidth} bg-zinc-200`} />
                  <Skeleton className="h-3 w-1/4 bg-zinc-100" />
                </div>
                <Skeleton className="h-8 w-8 rounded shrink-0 bg-zinc-100" />
              </div>
            ))}
          </Fragment>
        ))}
      </section>
    </>
  );
}
