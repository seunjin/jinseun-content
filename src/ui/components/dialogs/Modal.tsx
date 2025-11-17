"use client";
import type { BaseDialogOptions } from "@shared/lib/react-layered-dialog/dialogs";
import { useBodyScrollLock } from "@ui/hooks/useBodyScrollLock";
import { cn } from "@ui/shadcn/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useDialogController } from "react-layered-dialog";

/**
 * 모달 오버레이 컨테이너 컴포넌트
 *
 * - react-layered-dialog의 컨트롤러와 함께 사용되는 최상위 오버레이 역할을 수행합니다.
 * - `dimmed` 옵션에 따라 배경 딤 처리 및 포인터 이벤트 허용 여부를 제어합니다.
 * - 접근성: 이 컴포넌트는 배경(오버레이)만 렌더링하며, 실제 다이얼로그 역할/레이블은 자식이 담당합니다.
 */
type ModalDialogProps = {
  /**
   * 오버레이 내부에 렌더링될 실제 다이얼로그 노드
   */
  children: React.ReactNode;
} & BaseDialogOptions;
const Modal = (props: ModalDialogProps) => {
  // 다이얼로그 컨트롤러에서 열림 상태, z-index, 언마운트 콜백, 상태 필드 추출
  const { isOpen, zIndex, unmount, getStateFields, close } =
    useDialogController<ModalDialogProps>();
  const {
    dimmed = true,
    children,
    closeOnBackdrop = true,
    lockScroll = true,
    closeOnEsc = true,
  } = getStateFields(props);
  // 다이얼로그 생애주기 동안 body 스크롤 잠금
  useBodyScrollLock(Boolean(lockScroll));
  // Esc로 닫기
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeOnEsc, close]);

  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 flex items-center justify-center",
            dimmed ? "pointer-events-auto" : "pointer-events-none",
          )}
          data-scroll-lock={lockScroll ? "true" : undefined}
          initial={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            backdropFilter: "blur(0px)",
          }}
          animate={{
            backgroundColor: dimmed ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0)",
            backdropFilter: "blur(4px)",
          }}
          exit={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            backdropFilter: "blur(0px)",
          }}
          style={{ zIndex }}
          onClick={(e) => {
            if (!dimmed || !closeOnBackdrop) return;
            if (e.target !== e.currentTarget) return;
            close();
          }}
        >
          {/* 자식이 실제 다이얼로그 콘텐츠(역할/레이블 포함)를 렌더링합니다. */}
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
