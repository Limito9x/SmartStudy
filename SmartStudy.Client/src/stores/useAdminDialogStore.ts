import { create } from "zustand";
import type { UserAdminDto } from "@/services/api";

interface DialogDataMap {
  CONFIRM_TOGGLE_STATUS: UserAdminDto;
}

export type AdminDialogType = keyof DialogDataMap | null;

interface AdminDialogState {
  isOpen: boolean;
  dialogType: AdminDialogType;
  selectedUser: UserAdminDto | null;
  openDialog: <T extends AdminDialogType>(type: T, user: DialogDataMap[T]) => void;
  closeDialog: () => void;
}

export const useAdminDialogStore = create<AdminDialogState>((set) => ({
  isOpen: false,
  dialogType: null,
  selectedUser: null,

  openDialog: (type, user) => {
    set({
      isOpen: true,
      dialogType: type,
      selectedUser: user as UserAdminDto,
    });
  },

  closeDialog: () => {
    set({
      isOpen: false,
      dialogType: null,
      selectedUser: null,
    });
  },
}));
