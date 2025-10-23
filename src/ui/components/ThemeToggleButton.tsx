"use client";

import { Button } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Icon from "./lucide-icons/Icon";

const ThemeToggleButton = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (resolvedTheme ?? theme) as "light" | "dark" | undefined;
  const next = current === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(next)}
      className={cn("transition-opacity duration-150")}
    >
      <Icon name={mounted ? (next === "dark" ? "Sun" : "Moon") : "Moon"} />
      <span className="sr-only">테마 전환</span>
    </Button>
  );
};

export default ThemeToggleButton;
