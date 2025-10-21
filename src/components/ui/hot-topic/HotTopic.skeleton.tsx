import { Skeleton } from "@shadcn/ui/skeleton";
import React from "react";

const SkeletonHotTopic = () => {
  return (
    <article className="flex flex-col gap-3">
      <Skeleton className="h-70" />
      <div className="flex items-center gap-2">
        <Skeleton className="sizs-10 size-8 rounded-full" />
        <div className="flex flex-col flex-1 gap-2">
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
        </div>
      </div>
    </article>
  );
};

export default SkeletonHotTopic;
