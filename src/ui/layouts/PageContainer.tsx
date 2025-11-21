import { cn } from "@ui/shadcn/lib/utils";
import type React from "react";
import AppFooter from "./AppFooter";
import AppSidebar from "./app-sidebar/AppSidebar";

interface MainProps
  extends Omit<React.ComponentPropsWithoutRef<"main">, "className"> {
  className?: string;
}

// 공통 main 래퍼
const MainShell = ({ className, ...rest }: MainProps) => (
  <main className={cn("app-layout", className)} {...rest} />
);

// 기본 컨테이너 (사이드바 없음)
const PageContainerDefault = ({ className, ...rest }: MainProps) => (
  <MainShell className={cn("page-container", className)} {...rest} />
);

// 사이드바 포함 컨테이너
const PageContainerWithSidebar = ({
  className,
  children,
  sidebarComponent,
  sidebarSticky = true,
  sidebarClassName,
  sidebarPostion = "left",
  ...rest
}: MainProps & {
  sidebarComponent: React.ReactNode;
  sidebarSticky?: boolean;
  sidebarClassName?: string;
  sidebarPostion?: "left" | "right";
}) => {
  return (
    <MainShell
      className={cn(
        "page-container-with-sidebar grid grid-cols-1 sm:gap-4 lg:gap-12",
        sidebarPostion === "left" &&
          "sm:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]",
        sidebarPostion === "right" &&
          "lg:grid-cols-[minmax(0,1fr)_var(--sidebar-width)]",
        className,
      )}
      {...rest}
    >
      {sidebarPostion === "left" && (
        <AppSidebar
          sticky={sidebarSticky}
          className={cn(
            "border-foreground/10 hidden sm:block",
            sidebarClassName,
          )}
        >
          {sidebarComponent}
        </AppSidebar>
      )}
      <div
        className={cn(
          "grid grid-rows-[1fr_auto] h-full pb-",
          "pb-[var(--main-container-padding-block-start)]",
        )}
      >
        <div className="h-full pb-[var(--main-container-padding-block-end)]">
          {children}
        </div>
        <AppFooter />
      </div>
      {sidebarPostion === "right" && (
        <AppSidebar
          sticky={sidebarSticky}
          className={cn(
            "border-foreground/10 hidden lg:block",
            sidebarClassName,
          )}
        >
          {sidebarComponent}
        </AppSidebar>
      )}
    </MainShell>
  );
};

const PageContainer = {
  Default: PageContainerDefault,
  WithSidebar: PageContainerWithSidebar,
};

export default PageContainer;
