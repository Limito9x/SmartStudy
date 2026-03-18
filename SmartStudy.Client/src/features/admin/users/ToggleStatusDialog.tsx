import { useEffect } from "react";
import { useAdminDialogStore } from "@/stores/useAdminDialogStore";
import { useToggleUserStatus } from "@/hooks/entities/useAdminUsers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ToggleStatusDialog() {
  const { isOpen, dialogType, selectedUser, closeDialog } =
    useAdminDialogStore();
  const { mutate: toggleStatus, isPending, isSuccess } = useToggleUserStatus();

  // Close dialog after successful mutation
  useEffect(() => {
    if (isSuccess) {
      closeDialog();
    }
  }, [isSuccess, closeDialog]);

  const handleConfirm = () => {
    if (selectedUser?.id) {
      toggleStatus({
        path: { id: Number(selectedUser.id) },
      });
    }
  };

  const isConfirmDialog = dialogType === "CONFIRM_TOGGLE_STATUS";
  const actionText = selectedUser?.isActive ? "khóa" : "mở khóa";

  return (
    <Dialog open={isOpen && isConfirmDialog} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn {actionText} người dùng{" "}
            <span className="font-semibold">{selectedUser?.fullName}</span>{" "}
            không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={closeDialog} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
