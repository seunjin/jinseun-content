import { LogoutButton } from "@ui/components/LogoutButton";
import { Separator } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { AppHeaderProps } from "./AppHeader";

const PCHeader = ({ session }: AppHeaderProps) => {
  const isAuthenticated = Boolean(session);
  // const displayName = user?.name;
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center w-full bg-background/10 backdrop-blur-md  border-border/50 dark:border-border h-[var(--header-height)]",
        "hidden lg:block",
      )}
    >
      <div
        className={cn(
          "app-layout app-header",
          "flex items-center justify-between",
          "h-full mx-auto",
        )}
      >
        <div className="flex items-center gap-6">
          <Link href={"/"}>
            <Image
              src="/assets/images/logo.svg"
              alt="@LOGO"
              width={80}
              height={34}
              className="cursor-pointer"
            />
          </Link>
          {/* <div className="flex items-center gap-4">
            <Link href={"#"} className="font-medium text-base text-primary">
              Content
            </Link>
            <Separator orientation="vertical" className="h-3 bg-border" />
            <Link href={"#"} className="font-medium text-base text-primary">
              Portfolio
            </Link>
          </div> */}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              {/* <span className="font-medium text-primary/70">{displayName}</span> */}
              {/* <Separator orientation="vertical" className="h-3 bg-border" /> */}
              <Link
                href="/admin"
                className="font-medium 
                text-foreground/50
                transition-all duration-200
                hover:text-foreground
                hover:underline hover:underline-offset-2"
              >
                Admin
              </Link>
              <Separator orientation="vertical" className="h-3 bg-border" />
              <LogoutButton />
            </>
          )}

          {/* <ThemeToggleButton /> */}
        </div>
      </div>
    </header>
  );
};

export default PCHeader;
