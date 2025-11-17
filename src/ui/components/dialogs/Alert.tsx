"use client";
import type { BaseDialogOptions } from "@shared/lib/react-layered-dialog/dialogs";
import { useBodyScrollLock } from "@ui/hooks/useBodyScrollLock";
import { Button } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect } from "react";
import {
  type DialogComponent,
  useDialogController,
} from "react-layered-dialog";

/**
 * 간단한 경고(확인) 다이얼로그 컴포넌트
 *
 * - 제목과 메시지를 표시하고, 하나의 확인 버튼으로 닫는 패턴을 제공합니다.
 * - `onOk` 콜백이 제공되면 닫히기 직전에 실행합니다.
 * - 접근성: `role="alertdialog"`, `aria-labelledby/aria-describedby`를 통해 보조기기 호환을 제공합니다.
 */
type AlertProps = {
  /**
   * 다이얼로그 제목 (선택)
   */
  title?: string | React.ReactNode;
  /**
   * 다이얼로그 본문 메시지
   */
  message: string | React.ReactNode;
  /**
   * 확인 버튼 클릭 시 실행되는 콜백 (실패/비동기 허용)
   */
  onOk?: () => void;
} & BaseDialogOptions;
const Alert: DialogComponent<AlertProps> = (props: AlertProps) => {
  const { id, isOpen, close, zIndex, unmount, getStateFields } =
    useDialogController<AlertProps>();

  const {
    title,
    message,
    onOk,
    dimmed = true,
    closeOnBackdrop = false,
    lockScroll = true,
    closeOnEsc = true,
  } = getStateFields(props);
  // 다이얼로그 생애주기 동안 body 스크롤 잠금
  useBodyScrollLock(Boolean(lockScroll));
  // 확인 버튼 핸들러: onOk 실행 후 다이얼로그 닫기
  const handleClose = useCallback(() => {
    onOk?.();
    close();
  }, [onOk, close]);

  // 오버레이 클릭 시 닫기 (딤 + 옵션 활성 시), 내부 클릭은 무시
  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!dimmed || !closeOnBackdrop) return;
    if (e.target !== e.currentTarget) return;
    close();
  };

  // Esc로 닫기
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeOnEsc, handleClose]);

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
          onClick={handleOverlayClick}
        >
          <motion.div
            className="bg-background border rounded-md px-4 py-4 w-[min(100%,360px)]"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`alert-${id}-title`}
            aria-describedby={`alert-${id}-message`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            {title && (
              <h3 id={`alert-${id}-title`} className="text-lg font-semibold">
                {title}
              </h3>
            )}
            <p
              id={`alert-${id}-message`}
              className="mt-2 text-sm text-muted-foreground"
            >
              {message}
            </p>
            <div className="mt-4 flex justify-end">
              <Button autoFocus size={"sm"} onClick={handleClose}>
                확인
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
