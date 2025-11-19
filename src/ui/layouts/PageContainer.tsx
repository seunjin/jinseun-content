import { cn } from "@ui/shadcn/lib/utils";
import type React from "react";
import AppSidebar from "./app-sidebar/AppSidebar";
import PageTopToolbar from "./PageTopToolbar";

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
  ...rest
}: MainProps & {
  sidebarComponent: React.ReactNode;
  sidebarSticky?: boolean;
  sidebarClassName?: string;
}) => {
  return (
    <MainShell
      className={cn(
        "page-container-with-sidebar grid grid-cols-1 lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:gap-6",
        className,
      )}
      {...rest}
    >
      <AppSidebar sticky={sidebarSticky} className={sidebarClassName}>
        {sidebarComponent}
      </AppSidebar>
      <div className="pb-[var(--main-container-padding-block-end)]">
        {children}
      </div>
    </MainShell>
  );
};

// 상단 툴바 + 기본 컨테이너
const PageContainerWithToolbar = ({
  toolbar,
  className,
  children,
  ...rest
}: MainProps & { toolbar: React.ReactNode }) => {
  return (
    <>
      <PageTopToolbar>{toolbar}</PageTopToolbar>
      <MainShell className={cn("page-container", className)} {...rest}>
        {children}
      </MainShell>
    </>
  );
};

// 상단 툴바 + 사이드바 포함 컨테이너
const PageContainerWithSidebarAndToolbar = ({
  toolbar,
  className,
  children,
  sidebarComponent,
  sidebarSticky = true,
  sidebarClassName,
  ...rest
}: MainProps & {
  toolbar: React.ReactNode;
  sidebarComponent: React.ReactNode;
  sidebarSticky?: boolean;
  sidebarClassName?: string;
}) => {
  return (
    <>
      <PageTopToolbar>{toolbar}</PageTopToolbar>
      <MainShell
        className={cn(
          "page-container-with-sidebar grid grid-cols-1 lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:gap-6",
          className,
        )}
        {...rest}
      >
        <AppSidebar sticky={sidebarSticky} className={sidebarClassName}>
          {sidebarComponent}
        </AppSidebar>
        <div className="pb-[var(--main-container-padding-block-end)]">
          {children}
        </div>
      </MainShell>
    </>
  );
};

const PageContainer = {
  Default: PageContainerDefault,
  WithSidebar: PageContainerWithSidebar,
  WithToolbar: PageContainerWithToolbar,
  WithSidebarAndToolbar: PageContainerWithSidebarAndToolbar,
};

export default PageContainer;
