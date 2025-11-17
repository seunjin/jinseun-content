import { Skeleton } from "@ui/shadcn/components";

const SkeletonUpdateCategoryModal = () => {
  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Skeleton className="h-5 w-1/6" />
        </div>
        <Skeleton className="h-9" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Skeleton className="h-5 w-1/6" />
        </div>
        <Skeleton className="h-9" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Skeleton className="h-5 w-1/6" />
        </div>
        <Skeleton className="h-16" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Skeleton className="h-5 w-1/6" />
        </div>
        <Skeleton className="h-5 w-1/6" />
      </div>

      <Skeleton className="h-10" />
    </div>
  );
};

export default SkeletonUpdateCategoryModal;
