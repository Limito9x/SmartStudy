import { create } from "zustand";

interface LayoutState {
  isInboxOpen: boolean;
  setInboxOpen: (open: boolean) => void;
  toggleInbox: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isInboxOpen: false,
  setInboxOpen: (open) => set({ isInboxOpen: open }),
  toggleInbox: () => set((state) => ({ isInboxOpen: !state.isInboxOpen })),
}));
