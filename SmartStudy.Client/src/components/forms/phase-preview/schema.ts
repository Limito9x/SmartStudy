import z from "zod";
import type { TaskType } from "@/services/api";

export type PhasePreviewSuggestedTask = {
  name: string;
  type: TaskType;
  startDateTime?: string | null;
  endDateTime?: string | null;
  description?: string | null;
};

export type PhasePreviewSuggestedRoutineSchedule = {
  dayOfWeek: number;
  startTime: string;
  duration: number;
  location?: string | null;
};

export type PhasePreviewSuggestedRoutine = {
  name: string;
  type: TaskType;
  instructor?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  schedules?: PhasePreviewSuggestedRoutineSchedule[];
};

export const phasePreviewFormSchema = z
  .object({
    title: z.string().min(1, "Tên giai đoạn không được để trống").max(200),
    type: z.enum(
      ["General", "ExamPrep", "Project", "Assignment", "Custom"] as const,
      {
        message: "Vui lòng chọn loại giai đoạn",
      },
    ),
    priority: z.coerce
      .number()
      .min(1, "Mức độ ưu tiên phải từ 1 đến 3")
      .max(3, "Mức độ ưu tiên phải từ 1 đến 3"),
    startDateTime: z.date(),
    endDateTime: z.date(),
    notes: z.string().nullable().optional(),
    applyTasks: z.boolean().default(true),
    applyRoutines: z.boolean().default(true),
  })
  .refine((value) => value.endDateTime >= value.startDateTime, {
    path: ["endDateTime"],
    message: "Ngày kết thúc phải sau ngày bắt đầu",
  });

export type PhasePreviewFormValues = z.infer<typeof phasePreviewFormSchema>;
