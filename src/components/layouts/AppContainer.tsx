import { cn } from "@shadcn/lib/utils";
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
      <main className={cn("app-layout app-main", "flex gap-6", className)}>
        <AppSideBar />
        <div className="flex-1">{children}</div>
      </main>
    );
  }

  return (
    <main className={cn("app-layout app-main", className)}>{children}</main>
  );
};

export default AppContainer;
