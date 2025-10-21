"use client";

import { Button } from "@shadcn/ui/button";
import { useTheme } from "next-themes";
import React from "react";

const ThemeToggleButton = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = (resolvedTheme ?? theme) as "light" | "dark" | undefined;
  const next = current === "dark" ? "light" : "dark";

  return (
    <Button
      onClick={() => setTheme(next)}
      variant="ghost"
      aria-label="Toggle color scheme"
    >
      <span suppressHydrationWarning>
        {!mounted ? "Loading..." : next === "dark" ? "Dark Mode" : "Light Mode"}
      </span>
    </Button>
  );
};

export default ThemeToggleButton;
