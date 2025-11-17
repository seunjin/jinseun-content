"use client";
import { BaseDialogOptions } from "@shared/lib/react-layered-dialog/dialogs";
import { cn } from "@ui/shadcn/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useDialogController } from "react-layered-dialog";
type ModalDialogProps = {
  children: React.ReactNode;
} & BaseDialogOptions;
const Modal = (props: ModalDialogProps) => {
  const { id, isOpen, zIndex, close, unmount, getStateFields } =
    useDialogController<ModalDialogProps>();
  const {
    closeOnOutsideClick,
    dimmed = true,
    children,
  } = getStateFields(props);

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
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
