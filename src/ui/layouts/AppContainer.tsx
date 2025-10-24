import { cn } from "@ui/shadcn/lib/utils";
import AppSideBar from "./AppSideBar";

const AppContainer = ({
  children,
  className,
  withSidebar = false,
}: {
  children?: React.ReactNode;
  className?: string;
  withSidebar?: boolean;
}) => {
  if (withSidebar) {
    return (
      <main
        className={cn(
          "app-layout app-main",
          "grid grid-cols-1 lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:gap-6",
          className,
        )}
      >
        <AppSideBar />
        <div className="min-w-0">{children}</div>
      </main>
    );
  }

  return (
    <main className={cn("app-layout app-main", className)}>{children}</main>
  );
};

export default AppContainer;
