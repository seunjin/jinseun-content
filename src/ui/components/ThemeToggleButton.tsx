"use client";
import { Button } from "@ui/shadcn/components";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Icon from "./lucide-icons/Icon";

const ThemeToggleButton = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null; // 또는 로딩용 스켈레톤
  }

  const current = (resolvedTheme ?? theme) as "light" | "dark" | undefined;
  const next = current === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      suppressHydrationWarning
      variant={"ghost"}
      size={"icon-sm"}
      onClick={() => setTheme(next)}
    >
      <Icon name={next === "dark" ? "Sun" : "Moon"} />
    </Button>
  );
};

export default ThemeToggleButton;
