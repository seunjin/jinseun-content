"use client";

import { dialog } from "@shared/lib/react-layered-dialog/dialogs";
import { DialogsRenderer } from "react-layered-dialog";

const ClientDialogRenderer = () => {
  return <DialogsRenderer store={dialog.store} />;
};

export default ClientDialogRenderer;
