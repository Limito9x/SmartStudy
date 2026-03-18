import { create } from "zustand";
import type { TaskFormValues } from "@/components/forms/task/schema";
import type { RoutineFormValues } from "@/components/forms/routine/schema";
import type { CourseFormValues } from "@/components/forms/course/schema";
import type { ScheduleFormValues } from "@/components/forms/schedule/schema";
import type { LogFormValues } from "@/components/forms/log/schema";

export interface DialogDataMap {
  TASK_FORM: {
    studyPlanId: number;
    taskId?: number;
    defaultValues?: TaskFormValues;
  };
  ROUTINE_FORM: {
    studyPlanId: number;
    routineId?: number;
    defaultValues?: RoutineFormValues;
  };
  COURSE_FORM: {
    studyPlanId: number;
    courseId?: number;
    defaultValues?: Partial<CourseFormValues>;
  };
    SCHEDULE_FORM: {
    routineId?: number;
    defaultValues: ScheduleFormValues;
  };
  LOG_WORK_FORM: {
    taskId: number;
    logId?: number;
    defaultValues?: LogFormValues;
  };
  CONFIRM_DELETE: {
    itemType: string;
    itemName: string;
    onConfirm: () => void;
  };
}

export type DialogType = keyof DialogDataMap;

interface DialogState {
  isOpen: boolean;
  type: DialogType | null;
  data: DialogDataMap[DialogType] | null;
  openDialog: <T extends DialogType>(type: T, data: DialogDataMap[T]) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  type: null,
  data: null,
  openDialog: (type, data) => {
    set({
      isOpen: true,
      type,
      data,
    });
  },
  closeDialog: () => {
    set({
      isOpen: false,
      type: null,
      data: null,
    });
  },
}));
