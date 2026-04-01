import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  activeSessionId: number | null;
  open: () => void;
  view: "list" | "thread";
  setView: (view: "list" | "thread") => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  setActiveSession: (id: number | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  activeSessionId: null,
  courseId: null,
  view: "list",
  setView: (view) => set({ view }),
  open: () =>
    set({
      isOpen: true,
      activeSessionId: null,
      view: "list",
    }),
  close: () => set({ isOpen: false, activeSessionId: null, view: "list" }),
  setOpen: (open) => set({ isOpen: open }),
  setActiveSession: (id) =>
    set({ activeSessionId: id, view: id ? "thread" : "list" }),
}));
