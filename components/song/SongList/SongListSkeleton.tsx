import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";
import { Fragment } from "react";
import InitialsNav from "./InitialsNav";

export default function SongListSkeleton() {
  const lineWidths = [
    ["w-1/2", "w-1/3", "w-4/5", "w-3/4"],
    ["w-1/4", "w-1/5", "w-3/4", "w-2/3"],
    ["w-1/3", "w-1/4", "w-5/6", "w-1/2"],
  ];

  return (
    <>
      <InitialsNav existingInitials={[]} />
      <section className="grid grid-cols-[auto_1fr]">
        {new Array(3).fill(0).map((_, idx) => (
          <Fragment key={`skeleton-${idx}`}>
            <Skeleton className="col-span-2 md:col-span-1 my-4 mr-4 pt-2 bg-secondary/50 size-10 md:size-20" />
            <div className="col-span-2 md:col-span-1">
              {lineWidths.map((widths, idx) => (
                <div
                  className="flex flex-col items-start border-b border-zinc-100 py-4 sm:p-4 w-full sm:rounded-lg"
                  key={`skeleton-${idx}`}
                >
                  <Skeleton
                    className={clsx(widths[0], "h-6 bg-primary mb-1 sm:mb-2")}
                  />
                  <Skeleton
                    className={clsx(widths[1], "h-4 bg-zinc-400 mb-2")}
                  />
                  <div className="flex flex-col gap-1 w-full">
                    {widths.slice(2).map((width, idx) => (
                      <Skeleton
                        className={clsx("h-4 bg-zinc-200", width)}
                        key={`line-${idx}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Fragment>
        ))}
      </section>
    </>
  );
}
