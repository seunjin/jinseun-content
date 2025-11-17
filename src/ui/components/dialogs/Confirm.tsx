"use client";

import type { BaseDialogOptions } from "@shared/lib/react-layered-dialog/dialogs";
import { useBodyScrollLock } from "@ui/hooks/useBodyScrollLock";
import { Button, Spinner } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect } from "react";
import {
  type DialogComponent,
  useDialogController,
} from "react-layered-dialog";

/**
 * 확인/취소 선택형 다이얼로그 컴포넌트 (async 지원)
 *
 * - `dialogs.ts`에서 `mode: "async"`로 등록되어 있어, `openDialogAsync('confirm', ...)` 호출 시
 *   `resolve/reject`로 호출 측과 상호작용합니다.
 * - `onConfirm`, `onCancel` 콜백이 제공되면 우선 실행하며, 예외 발생 시 `reject`로 전달합니다.
 * - 로딩 상태(`status === 'loading'`) 동안 버튼을 비활성화하여 중복 입력을 방지합니다.
 */
type ConfirmDialogProps = {
  /**
   * 다이얼로그 제목 (선택)
   */
  title?: string | React.ReactNode;
  /**
   * 다이얼로그 본문 메시지
   */
  message: string | React.ReactNode;
  /**
   * 확인 버튼 텍스트 (기본: "확인")
   */
  confirmButtonText?: string;
  /**
   * 취소 버튼 텍스트 (기본: "취소")
   */
  cancelButtonText?: string;
  /**
   * 확인 시 실행되는 콜백 (동기/비동기 허용). 예외는 `reject`로 전파됩니다.
   */
  onConfirm?: () => void;
  /**
   * 취소 시 실행되는 콜백 (동기/비동기 허용). 예외는 `reject`로 전파됩니다.
   */
  onCancel?: () => void;
} & BaseDialogOptions;

const Confirm: DialogComponent<ConfirmDialogProps> = (
  props: ConfirmDialogProps,
) => {
  const {
    id,
    isOpen,
    zIndex,
    status,
    close,
    unmount,
    getStateFields,
    reject,
    resolve,
  } = useDialogController<ConfirmDialogProps>();

  const isLoading = status === "loading";
  const isDone = status !== "done";
  const {
    title,
    message,
    cancelButtonText = "취소",
    confirmButtonText = "확인",
    onCancel,
    onConfirm,
    dimmed = true,
    closeOnBackdrop = false,
    lockScroll = true,
    closeOnEsc = true,
  } = getStateFields(props);
  // 다이얼로그 생애주기 동안 body 스크롤 잠금
  useBodyScrollLock(Boolean(lockScroll));

  // 확인 처리: onConfirm가 있으면 우선 실행, 없으면 resolve 후 닫기
  const handleConfirm = useCallback(async () => {
    if (isLoading) return;

    if (onConfirm) {
      try {
        await Promise.resolve(onConfirm());
      } catch (error) {
        reject?.(error);
      }
      return;
    }

    resolve?.({ ok: true });
    close();
  }, [isLoading, onConfirm, reject, resolve, close]);

  // 취소 처리: onCancel가 있으면 우선 실행, 없으면 resolve 후 닫기
  const handleCancel = useCallback(async () => {
    if (isLoading) return;

    if (onCancel) {
      try {
        await Promise.resolve(onCancel());
      } catch (error) {
        reject?.(error);
      }
      return;
    }

    resolve?.({ ok: false });
    close();
  }, [isLoading, onCancel, reject, resolve, close]);

  // Esc로 취소 처리
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeOnEsc, handleCancel]);
  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 flex items-center justify-center",
            dimmed ? "pointer-events-auto" : "pointer-events-none",
          )}
          data-scroll-lock={lockScroll ? "true" : undefined}
          onClick={(e) => {
            if (!dimmed || !closeOnBackdrop) return;
            if (e.target !== e.currentTarget) return;
            // 오버레이 클릭은 취소로 간주
            if (isLoading) return;
            handleCancel();
          }}
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
        >
          <motion.div
            className="bg-background border rounded-md px-4 py-4 w-[min(100%,360px)]"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`confirm-${id}-title`}
            aria-describedby={`confirm-${id}-message`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            {title && (
              <h3 id={`confirm-${id}-title`} className="text-lg font-semibold">
                {title}
              </h3>
            )}
            <p
              id={`confirm-${id}-message`}
              className="mt-2 text-sm text-muted-foreground"
            >
              {message}
            </p>

            <div className="mt-4 flex justify-end gap-2">
              {isDone && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {cancelButtonText}
                </Button>
              )}
              <Button
                autoFocus
                size="sm"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading && <Spinner className="h-4 w-4 animate-spin" />}
                {confirmButtonText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Confirm;
