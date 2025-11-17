import Alert from "@ui/components/dialogs/Alert";
import Confirm from "@ui/components/dialogs/Confirm";
import Modal from "@ui/components/dialogs/Modal";
import { createDialogApi, DialogStore } from "react-layered-dialog";

export type BaseDialogOptions = {
  closeOnOutsideClick?: boolean;
  dimmed?: boolean;
};

export const dialog = createDialogApi(new DialogStore(), {
  alert: { component: Alert },
  confirm: { component: Confirm, mode: "async" },
  modal: { component: Modal },
});

export const openDialog = dialog.open;
export const openDialogAsync = dialog.openAsync;
export const closeDialog = dialog.close;
export const closeAllDialogs = dialog.closeAll;
export const updateDialog = dialog.update;
