import { create } from "zustand";

interface DialogState {
  isOpen: boolean;
  title: string;
  description: string;
  view: React.ReactNode;
  openDialog: (config: {
    title: string;
    description?: string;
    view: React.ReactNode;
  }) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  view: null,
  openDialog: (config) => {
    set({
      ...config,
      isOpen: true,
    });
  },
  closeDialog: () => {
    set({
      isOpen: false,
    });
  },
}));
