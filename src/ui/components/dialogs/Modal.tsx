"use client";
import {
  type ModalDialogProps,
  useDialogs,
} from "@shared/lib/react-layered-dialog/dialogs";
import { cn } from "@ui/shadcn/lib/utils";
import { motion } from "motion/react";
import { useCallback } from "react";
import { useLayerBehavior } from "react-layered-dialog";

const Modal = ({
  id,
  zIndex,
  closeOnEscape = true,
  closeOnOutsideClick,
  dimmed = true,
  children,
}: ModalDialogProps) => {
  const { dialogs, closeDialog } = useDialogs();
  const handleClose = useCallback(() => {
    closeDialog(id);
  }, [closeDialog, id]);

  useLayerBehavior({
    id,
    dialogs,
    zIndex,
    closeOnEscape,
    onEscape: handleClose,
    closeOnOutsideClick,
    onOutsideClick: handleClose,
  });
  return (
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
  );
};

export default Modal;
