import React from "react";
import { Button } from "@shadcn/ui/button";
import { INSIGHT_CATEGORY } from "../../constants/category.constants";
import Icon from "@components/lib/lucide-icons/Icon";

const AppSideBar = () => {
  return (
    <aside className="w-60">
      <div className="flex items-center gap-2 pb-6">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          카테고리
        </h4>
        <Icon name={"ChevronDown"} />
      </div>
      <div>
        {INSIGHT_CATEGORY.map((category) => (
          <div key={category.id} className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-white hover:pl-6 transition-[padding-left,color] duration-500 w-full justify-start "
            >
              <Icon name={category.icon} />
              {category.label}
            </Button>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default AppSideBar;
