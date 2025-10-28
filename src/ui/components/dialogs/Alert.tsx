"use client";
import {
  type AlertDialogProps,
  useDialogs,
} from "@shared/lib/react-layered-dialog/dialogs";
import { Button } from "@ui/shadcn/components";
import { useCallback, useRef } from "react";
import { useLayerBehavior } from "react-layered-dialog";

const Alert = ({
  id,
  title,
  message,
  onOk,
  zIndex,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  dimmed = true,
}: AlertDialogProps) => {
  const { dialogs, closeDialog } = useDialogs();
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onOk?.();
    closeDialog(id);
  }, [closeDialog, id, onOk]);

  useLayerBehavior({
    id,
    dialogs,
    zIndex,
    closeOnEscape,
    onEscape: handleClose,
    closeOnOutsideClick,
    onOutsideClick: handleClose,
    outsideClickRef: panelRef,
  });

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-none ${
        dimmed
          ? "bg-black/40 pointer-events-auto"
          : "bg-transparent pointer-events-none"
      }`}
      style={{ zIndex }}
    >
      <div
        ref={panelRef}
        className="pointer-events-auto relative min-w-[280px] rounded-lg border border-border bg-white p-6 shadow-lg"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`alert-${id}-title`}
        aria-describedby={`alert-${id}-message`}
      >
        <h3 id={`alert-${id}-title`} className="text-lg font-semibold">
          {title}
        </h3>
        <p
          id={`alert-${id}-message`}
          className="mt-2 text-sm text-muted-foreground"
        >
          {message}
        </p>
        <div className="mt-4 flex justify-end">
          <Button autoFocus onClick={handleClose}>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
