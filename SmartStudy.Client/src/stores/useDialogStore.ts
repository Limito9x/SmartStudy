import { create } from "zustand";
import type { TaskFormValues } from "@/components/forms/task/schema";
import type { RoutineFormValues } from "@/components/forms/routine/schema";
import type { CourseFormValues } from "@/components/forms/course/schema";
import type { ScheduleFormValues } from "@/components/forms/schedule/schema";
import type { LogFormValues } from "@/components/forms/log/schema";
import type { StudyPlanFormValues } from "@/components/forms/study-plan/schema";
import type { StudyPlanType, UpdatePlanTemplateDto } from "@/services/api";
import type { TimelineEventFormValues } from "@/components/forms/timeline-event/schema";
import type { SubjectFormValues } from "@/components/forms/subject/schema";

export interface DialogDataMap {
  EVENT_FORM: {
    courseId?: number;
    eventId?: number;
    defaultValues?: TimelineEventFormValues;
  };
  STUDY_PLAN_FORM: {
    studyPlanId?: number;
    defaultValues?: StudyPlanFormValues;
  };
  SUBJECT_FORM: {
    subjectId?: number;
    defaultValues?: SubjectFormValues;
  };
  TASK_FORM: {
    taskId?: number;
    courseId?: number;
    eventId?: number;
    defaultValues?: TaskFormValues;
  };
  ROUTINE_FORM: {
    routineId?: number;
    courseId?: number;
    eventId?: number;
    defaultValues?: RoutineFormValues;
  };
  COURSE_FORM: {
    type: StudyPlanType;
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
  PLAN_TEMPLATE_EDIT: {
    templateId: number;
    defaultValues: UpdatePlanTemplateDto;
  };
  PLAN_TEMPLATE_SELECT_PLAN: Record<string, never>;
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
