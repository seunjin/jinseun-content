import { cn } from "@ui/shadcn/lib/utils";
import type React from "react";

type AppSidebarProps = {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
};

const AppSidebar = ({
  children,
  sticky = true,
  className,
}: AppSidebarProps) => {
  const stickyClasses = sticky
    ? [
        "sticky top-[calc(var(--header-height)+var(--page-toolbar-offset,0px)+var(--main-container-padding-block-start))]",
        "h-[calc(100dvh-var(--header-height)-var(--page-toolbar-offset,0px)-calc(var(--main-container-padding-block-start)*2))]",
      ]
    : [];
  return (
    <aside
      className={cn(
        ...stickyClasses,
        "w-[var(--sidebar-width)] shrink-0 ",

        className,
      )}
    >
      <div className="overflow-auto h-full overscroll-contain">{children}</div>
    </aside>
  );
};

export default AppSidebar;
