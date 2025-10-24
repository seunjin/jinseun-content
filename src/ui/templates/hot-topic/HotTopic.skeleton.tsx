import { Skeleton } from "@ui/shadcn/components";

const SkeletonHotTopic = () => {
  return (
    <article className="flex min-w-[236px] flex-col gap-3">
      <Skeleton className="h-70" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 flex-none rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
        </div>
      </div>
    </article>
  );
};

export default SkeletonHotTopic;
