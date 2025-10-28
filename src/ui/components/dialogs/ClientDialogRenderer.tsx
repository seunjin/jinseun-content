"use client";

import { useDialogs } from "@shared/lib/react-layered-dialog/dialogs";
import { DialogRenderer } from "./DialogRenderer";

const ClientDialogRenderer = () => {
  const { dialogs } = useDialogs();
  return <DialogRenderer dialogs={dialogs} />;
};

export default ClientDialogRenderer;
