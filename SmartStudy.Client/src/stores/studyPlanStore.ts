import { create } from "zustand";

interface StudyPlanState {
  activePlanId: number | string | null;
  setActivePlanId: (id: number | string) => void;
}

export const useStudyPlanStore = create<StudyPlanState>((set) => ({
  activePlanId: null,
  setActivePlanId: (id) => set({ activePlanId: id }),
}));
