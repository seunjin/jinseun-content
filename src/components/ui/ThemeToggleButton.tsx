"use client";

import { useTheme } from "next-themes";
import React from "react";

const ThemeToggleButton = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const current = (resolvedTheme ?? theme) as "light" | "dark" | undefined;
  const next = current === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      aria-label="Toggle color scheme"
      className="font-medium cursor-pointer"
    >
      <span suppressHydrationWarning>
        {!mounted ? "Loading..." : next === "dark" ? "Dark Mode" : "Light Mode"}
      </span>
    </button>
  );
};

export default ThemeToggleButton;
