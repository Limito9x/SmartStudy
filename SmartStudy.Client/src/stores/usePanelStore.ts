import { create } from "zustand";

export interface PanelDataMap {
  CHAT: {
    courseId?: number | null;
  };
  TASK_DETAIL: {
    taskId: number;
  };
}

export type PanelType = keyof PanelDataMap;

interface PanelState {
  isOpen: boolean;
  type: PanelType | null;
  data: PanelDataMap[PanelType] | null;
  openPanel: <T extends PanelType>(type: T, data: PanelDataMap[T]) => void;
  closePanel: () => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  isOpen: false,
  type: null,
  data: null,
  openPanel: (type, data) => {
    set({
      isOpen: true,
      type,
      data,
    });
  },
  closePanel: () => set({ isOpen: false, type: null, data: null }),
}));
