import Alert from "@ui/components/dialogs/Alert";
import Confirm from "@ui/components/dialogs/Confirm";
import Modal from "@ui/components/dialogs/Modal";
import {
  type BaseLayerProps,
  createDialogManager,
  createUseDialogs,
  type DialogState,
} from "react-layered-dialog";

type AlertState = {
  type: "alert";
  title: string;
  message: string;
  onOk?: () => void;
} & Partial<BaseLayerProps>;

type ConfirmState = {
  type: "confirm";
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
} & Partial<BaseLayerProps>;

type ModalState = {
  type: "modal";
  children: React.ReactNode;
} & Partial<BaseLayerProps>;

export type AppDialogState = AlertState | ConfirmState | ModalState;

export type AlertDialogProps = DialogState<AlertState>;
export type ConfirmDialogProps = DialogState<ConfirmState>;
export type ModalDialogProps = DialogState<ModalState>;

const { manager } = createDialogManager<AppDialogState>();

export const useDialogs = createUseDialogs(manager, {
  alert: Alert,
  confirm: Confirm,
  modal: Modal,
});
export const dialogs = manager.subscribe;
export const openDialog = manager.openDialog;
export const closeDialog = manager.closeDialog;
export const closeAllDialogs = manager.closeAllDialogs;
export const updateDialog = manager.updateDialog;
