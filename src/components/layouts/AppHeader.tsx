import ThemeToggleButton from "@components/ui/ThemeToggleButton";
import { cn } from "@shadcn/lib/utils";
import { Button } from "@shadcn/ui/button";
import { Separator } from "@shadcn/ui/separator";
import Link from "next/link";
import React from "react";

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-10 flex items-center w-full  bg-background backdrop-blur-md">
      <div
        className={cn(
          "main-container",
          "h-[var(--header-height)] mx-auto flex items-center justify-between "
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
            <Link href={"#"} className="font-medium text-base text-gray-200">
              Insight
            </Link>
            <Separator orientation="vertical" className="!h-3 !bg-white/40" />
            <Link href={"#"} className="font-medium text-base text-white">
              Portfolio
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="font-medium text-muted-foreground hover:text-white transition-[color] duration-300 cursor-pointer"
          >
            Sign In
          </Button>
          <Separator orientation="vertical" className="!h-3 !bg-white/40" />
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
