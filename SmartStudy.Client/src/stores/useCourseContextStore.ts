import { create } from "zustand";

interface CourseContextState {
  activeCourseId: number | null;
  setActiveCourseId: (courseId: number | null) => void;
}

export const useCourseContextStore = create<CourseContextState>((set) => ({
  activeCourseId: null,
  setActiveCourseId: (courseId) =>
    set({
      activeCourseId: courseId,
    }),
}));
