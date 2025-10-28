import { cn } from "@ui/shadcn/lib/utils";

interface PageTopToolBarProps {
  leftSideComponents: React.ReactNode;
  rightSideComponents: React.ReactNode;
}
const PageTopToolBar = ({
  leftSideComponents,
  rightSideComponents,
}: PageTopToolBarProps) => {
  return (
    <div className="h-[var(--header-height)]">
      <div
        className={cn(
          "fixed z-10 h-[inherit] left-0 right-0 top-[var(--header-height)] bg-background/10  backdrop-blur-md",
          "border-b border-border/50 dark:border-border",
        )}
      >
        <div
          className={cn(
            "app-layout app-header h-full",
            "flex items-center justify-between",
          )}
        >
          <div className="flex gap-2">{leftSideComponents}</div>
          <div className="flex gap-2">{rightSideComponents}</div>
        </div>
      </div>
    </div>
  );
};

export default PageTopToolBar;
