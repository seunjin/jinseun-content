import { cn } from "@ui/shadcn/lib/utils";

interface PageTopToolbarProps {
  children?: React.ReactNode;
}

const PageTopToolbar = ({ children }: PageTopToolbarProps) => {
  return (
    <div className="h-[var(--page-toolbar-height)]">
      <div
        className={cn(
          "fixed z-10 h-[inherit] left-0 right-0 top-[var(--page-toolbar-height)] bg-background/10  backdrop-blur-md",
          "border-b border-border/50 dark:border-border",
        )}
      >
        <div
          className={cn(
            "app-layout app-header h-full",
            "flex items-center justify-between",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageTopToolbar;
