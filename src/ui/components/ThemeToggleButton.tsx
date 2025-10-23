"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggleButton = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = (resolvedTheme ?? theme) as "light" | "dark" | undefined;
  const next = current === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
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
