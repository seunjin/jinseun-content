import { cn } from "@ui/shadcn/lib/utils";

const AppContainer = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "antialiased min-h-[100dvh] grid grid-rows-[auto_1fr_auto] bg-background",

        className,
      )}
    >
      {children}
    </div>
  );
};

export default AppContainer;
