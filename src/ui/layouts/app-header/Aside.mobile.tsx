"use client";
import { useSidebar } from "@stores/useSidebar.mobile";
import { cn } from "@ui/shadcn/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { AppHeaderProps } from "./AppHeader";
import AsideCloseButton from "./AsideCloseButton.mobile";

const MobileAside = ({ session, user }: AppHeaderProps) => {
  const { sidebarTrigger } = useSidebar();
  return (
    <AnimatePresence>
      {sidebarTrigger && (
        <motion.aside
          className="fixed z-20 inset-0 bg-background/10 backdrop-blur-md px-[var(--global-inline-padding)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={cn("flex flex-col h-full")}>
            <div className="flex items-center justify-end h-[var(--header-height)]">
              <AsideCloseButton />
            </div>
            <div className="flex flex-col justify-center items-center bg-amber-200">
              <Link href={"/"}>Content</Link>
              <Link href={"/"}>Portfolio</Link>
            </div>
          </div>
          {session && user?.name}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
export default MobileAside;
