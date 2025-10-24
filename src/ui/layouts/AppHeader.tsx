import type { ProfileRow } from "@features/profiles/schemas";
import type { Session } from "@supabase/supabase-js";
import { LogoutButton } from "@ui/components/LogoutButton";
import ThemeToggleButton from "@ui/components/ThemeToggleButton";
import { Separator } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import Image from "next/image";
import Link from "next/link";

type AppHeaderProps = {
  session: Session | null;
  user: ProfileRow | null;
};

const AppHeader = ({ session, user }: AppHeaderProps) => {
  const isAuthenticated = Boolean(session);
  const displayName = user?.name;

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
              Content
            </Link>
            <Separator orientation="vertical" className="h-3 bg-border" />
            <Link href={"#"} className="font-medium text-base text-primary">
              Portfolio
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <span className="font-medium text-primary/70">{displayName}</span>
              <Separator orientation="vertical" className="h-3 bg-border" />
              <Link href="/admin" className="font-medium">
                관리자 페이지
              </Link>
              <Separator orientation="vertical" className="h-3 bg-border" />
              <LogoutButton />
            </>
          )}

          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
