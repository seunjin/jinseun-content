import type { ProfileRow } from "@features/profiles/schemas";
import type { Session } from "@supabase/supabase-js";
import { cn } from "@ui/shadcn/lib/utils";
import Image from "next/image";
import Link from "next/link";
import AppHeaderAside from "./AppHeaderAside";
import AsideOpenButton from "./AsideOpenButton";

export type AppHeaderProps = {
  session: Session | null;
  user: ProfileRow | null;
};

const AppHeader = ({ session, user }: AppHeaderProps) => {
  const isAuthenticated = Boolean(session);
  // const displayName = user?.name;
  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-10 flex items-center w-full bg-background/50 backdrop-blur-md h-[var(--header-height)]",
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
            <Link href="/">
              <Image
                src="/assets/images/logo.svg"
                alt="@LOGO"
                width={80}
                height={34}
                className="cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && <AsideOpenButton />}

            {/* <ThemeToggleButton /> */}
          </div>
        </div>
      </header>
      <AppHeaderAside session={session} user={user} />
    </>
  );
};

export default AppHeader;
