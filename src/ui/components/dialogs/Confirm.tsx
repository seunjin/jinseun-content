"use client";

import type { BaseDialogOptions } from "@shared/lib/react-layered-dialog/dialogs";
import { Button, Spinner } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import {
  type DialogComponent,
  useDialogController,
} from "react-layered-dialog";

type ConfirmDialogProps = {
  title?: string | React.ReactNode;
  message: string | React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
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
  } = getStateFields(props);

  const handleConfirm = async () => {
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
  };

  const handleCancel = async () => {
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
  };
  return (
    <AnimatePresence onExitComplete={unmount}>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 flex items-center justify-center",
            dimmed ? "pointer-events-auto" : "pointer-events-none",
          )}
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
