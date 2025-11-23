"use client";
import { useSidebar } from "@stores/useSidebar.mobile";
import { LogoutButton } from "@ui/components/LogoutButton";
import { useBodyScrollLock } from "@ui/hooks/useBodyScrollLock";
import { cn } from "@ui/shadcn/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { AppHeaderProps } from "./AppHeader";
import AsideCloseButton from "./AsideCloseButton";

const AppHeaderAside = ({ session, user }: AppHeaderProps) => {
  const { sidebarTrigger, sidebarClose } = useSidebar();
  useBodyScrollLock(sidebarTrigger);

  return (
    <AnimatePresence>
      {sidebarTrigger && session && (
        <aside className={"fixed scroll-lock inset-0 z-20"}>
          {/* Overlay */}
          <motion.div
            className="absolute inset-0"
            onClick={sidebarClose}
            initial={{
              backgroundColor: "rgba(0, 0, 0, 0)",
              backdropFilter: "blur(0px)",
            }}
            animate={{
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
            }}
            exit={{
              backgroundColor: "rgba(0, 0, 0, 0)",
              backdropFilter: "blur(0px)",
            }}
          />
          {/* Content */}
          <div className="app-layout px-[1rem] relative z-1 max-w-md bg-background">
            <motion.div
              className={cn("flex h-full flex-col ")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 헤더: 닫기 버튼 */}
              <div className="flex h-[var(--header-height)] items-center justify-end">
                <AsideCloseButton />
              </div>
              {/* 본문: 관리자 메뉴 */}
              <nav className="flex flex-1 flex-col gap-6 pb-6">
                <div className="space-y-2 px-1">
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">
                    PUBLIC
                  </p>
                  <Link
                    href="/"
                    className="flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-base text-foreground/60 transition-[color]
                        hover:text-foreground
                        "
                    onClick={sidebarClose}
                  >
                    홈
                  </Link>
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">
                    ADMIN
                  </p>
                  <div className="space-y-1">
                    <div className="mt-1 flex flex-col gap-1">
                      <Link
                        href="/admin/post"
                        className="flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-base text-foreground/60 transition-[color]
                        hover:text-foreground
                        "
                        onClick={sidebarClose}
                      >
                        글 리스트
                      </Link>
                      <Link
                        href="/admin/post/create"
                        className="flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-base text-foreground/60 transition-[color]
                        hover:text-foreground
                        "
                        onClick={sidebarClose}
                      >
                        글 작성하기
                      </Link>
                      <Link
                        href="/admin/category"
                        className="flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-base text-foreground/60 transition-[color]
                        hover:text-foreground
                        "
                        onClick={sidebarClose}
                      >
                        카테고리 관리
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 푸터: 프로필 + 로그아웃 */}
                <div className="mt-auto flex items-center justify-between border-t px-2 pt-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {user?.name ?? "관리자"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <LogoutButton />
                </div>
              </nav>
            </motion.div>
          </div>
        </aside>
      )}
    </AnimatePresence>
  );
};
export default AppHeaderAside;
