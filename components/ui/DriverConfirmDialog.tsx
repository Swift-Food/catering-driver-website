"use client";

import { useDriver } from "@/lib/drivers/driverContext";
import ConfirmDialog from "./ConfirmDialog";

export default function DriverConfirmDialog() {
  const { pendingAction, confirmPendingAction, cancelPendingAction } = useDriver();

  return (
    <ConfirmDialog
      isOpen={pendingAction !== null}
      title="Unconfirmed Photos"
      message={pendingAction?.message ?? ""}
      confirmLabel="Continue"
      cancelLabel="Stay"
      onConfirm={confirmPendingAction}
      onCancel={cancelPendingAction}
    />
  );
}
