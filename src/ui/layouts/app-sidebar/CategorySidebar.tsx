import { CONTENT_CATEGORY } from "@shared/constants/category.constants";
import Icon from "@ui/components/lucide-icons/Icon";
import { cn } from "@ui/shadcn/lib/utils";

const CategorySidebar = () => {
  return (
    <>
      <div className="flex items-center gap-2 pb-6">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          카테고리
        </h4>
      </div>
      <div className="overflow-auto h-[calc(100%-52px)] overscroll-contain">
        {CONTENT_CATEGORY.map((category) => (
          <div key={category.id} className="flex items-center gap-2 mb-2">
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 w-full justify-start px-3 py-2",
                "text-primary/35  rounded-lg ",
                "transition-[padding-left,color,background-color] duration-300",
                "cursor-pointer",
                "hover:text-primary hover:pl-5 hover:bg-border/30 dark:hover:bg-primary/20",
              )}
            >
              <Icon name={category.icon} size={16} />
              {category.label}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default CategorySidebar;
