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
import type { PhaseType, TaskType } from "@/services/api";

export interface DialogDataMap {
  EVENT_FORM: {
    courseId?: number;
    eventId?: number;
    defaultValues?: TimelineEventFormValues;
  };
  PHASE_FORM: {
    courseId: number;
    phaseId?: number;
    defaultValues?: TimelineEventFormValues;
  };
  PHASE_PREVIEW_FORM: {
    courseId: number;
    phaseDefaultValues?: {
      title?: string;
      type?: PhaseType;
      priority?: number;
      startDateTime?: string;
      endDateTime?: string;
      notes?: string | null;
    };
    suggestedTasks?: Array<{
      name: string;
      type: TaskType;
      startDateTime?: string | null;
      endDateTime?: string | null;
      description?: string | null;
    }>;
    suggestedRoutines?: Array<{
      name: string;
      type: TaskType;
      instructor?: string | null;
      description?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      schedules?: Array<{
        dayOfWeek: number;
        startTime: string;
        duration: number;
        location?: string | null;
      }>;
    }>;
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
    phaseId?: number;
    eventId?: number;
    defaultValues?: TaskFormValues;
  };
  ROUTINE_FORM: {
    routineId?: number;
    courseId?: number;
    phaseId?: number;
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
  CONFIRM_ACTION: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  };
  PLAN_TEMPLATE_EDIT: {
    templateId?: number;
    defaultValues: UpdatePlanTemplateDto;
    mode?: "edit" | "publish";
    lockPublic?: boolean;
    nameHint?: string;
    submitLabel?: string;
    onSubmit?: (values: UpdatePlanTemplateDto) => Promise<void> | void;
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
