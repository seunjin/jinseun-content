import { Skeleton } from "@ui/shadcn/components";

const SkeletonNewTopic = () => {
  return (
    <article className="flex flex-col gap-3">
      <Skeleton className="h-55" />
    </article>
  );
};

export default SkeletonNewTopic;
