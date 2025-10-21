import { cn } from "@shadcn/lib/utils";
import React from "react";
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
      <main className={cn("main-container", "flex gap-6", className)}>
        <AppSideBar />
        <div className="flex-1">{children}</div>
      </main>
    );
  }

  return <main className={cn("main-container", className)}>{children}</main>;
};

export default AppContainer;
