import ThemeToggleButton from "@components/ui/ThemeToggleButton";
import { cn } from "@shadcn/lib/utils";
import { Button } from "@shadcn/ui/button";
import { Separator } from "@shadcn/ui/separator";
import Link from "next/link";
import React from "react";

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-10 flex items-center w-full  bg-background/10 backdrop-blur-md border-b border-border/50 dark:border-border h-[var(--header-height)]">
      <div
        className={cn(
          "main-container",
          "h-full mx-auto flex items-center justify-between "
        )}
      >
        <div className="flex items-center gap-6">
          <Link href={"#"}>
            <img
              src="https://github.com/seunjin.png"
              alt="@LOGO"
              className="w-6 h-6 cursor-pointer rounded-full"
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
          <button className="font-medium text-primary/50 hover:text-primary transition-[color] duration-300 cursor-pointer">
            Sign In
          </button>

          <Separator orientation="vertical" className="h-3 bg-border" />
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
