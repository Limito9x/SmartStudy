import { create } from "zustand";

interface ChatDrawerState {
  isOpen: boolean;
  activeSessionId: number | null; // Null = Đang ở màn hình Danh sách, Số = Đang ở trong 1 đoạn chat
  courseId: number | null; // Null = Global Butler, Số = Course Tutor
  open: (courseId?: number) => void;
  view: "list" | "thread";
  setView: (view: "list" | "thread") => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  setActiveSession: (id: number | null) => void;
}

export const useChatDrawerStore = create<ChatDrawerState>((set) => ({
  isOpen: false,
  activeSessionId: null,
  courseId: null,
  view: "list",
  setView: (view) => set({ view }),
  open: (courseId) =>
    set({
      isOpen: true,
      courseId,
      activeSessionId: null,
      view: "list",
    }),
  close: () => set({ isOpen: false, activeSessionId: null, view: "list" }),
  setOpen: (open) => set({ isOpen: open }),
  setActiveSession: (id) =>
    set({ activeSessionId: id, view: id ? "thread" : "list" }),
}));
