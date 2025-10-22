import { LogoutButton } from "@components/ui/LogoutButton";
import ThemeToggleButton from "@components/ui/ThemeToggleButton";
import { cn } from "@shadcn/lib/utils";
import { Separator } from "@shadcn/ui";
import type { Session } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

const AppHeader = ({ session }: { session: Session | null }) => {
  console.log(session);
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center w-full  bg-background/10 backdrop-blur-md border-b border-border/50 dark:border-border h-[var(--header-height)]",
      )}
    >
      <div
        className={cn(
          "app-layout app-header",
          "h-full mx-auto flex items-center justify-between ",
        )}
      >
        <div className="flex items-center gap-6">
          <Link href={"/"}>
            <Image
              src="https://avatars.githubusercontent.com/seunjin"
              alt="@LOGO"
              width={24}
              height={24}
              className="cursor-pointer rounded-full"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link href={"#"} className="font-medium text-base text-primary">
              Insight
            </Link>
            <Separator orientation="vertical" className="h-3 bg-border" />
            <Link href={"#"} className="font-medium text-base text-primary">
              Portfolio
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="font-medium text-primary/50 hover:text-primary transition-[color] duration-300 cursor-pointer"
          >
            Sign In
          </button>

          <Separator orientation="vertical" className="h-3 bg-border" />
          <ThemeToggleButton />
          <Separator orientation="vertical" className="h-3 bg-border" />
          <Link href="/admin" className="font-medium">
            Admin
          </Link>
          <Separator orientation="vertical" className="h-3 bg-border" />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
