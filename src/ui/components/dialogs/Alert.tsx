"use client";
import type { BaseDialogOptions } from "@shared/lib/react-layered-dialog/dialogs";
import { Button } from "@ui/shadcn/components";
import { cn } from "@ui/shadcn/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import {
  type DialogComponent,
  useDialogController,
} from "react-layered-dialog";

type AlertProps = {
  title?: string | React.ReactNode;
  message: string | React.ReactNode;
  onOk?: () => void;
} & BaseDialogOptions;
const Alert: DialogComponent<AlertProps> = (props: AlertProps) => {
  const { id, isOpen, close, zIndex, unmount, getStateFields } =
    useDialogController<AlertProps>();

  const { title, message, onOk, dimmed = true } = getStateFields(props);
  const handleClose = () => {
    onOk?.();
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
