import z from "zod";
import type { ScheduleDto, RequestRoutineDto } from "@/services/api";

// --- Schedule Item (dùng trong Routine) ---

export const scheduleItemSchema = z.object({
  dayOfWeek: z.coerce
    .number()
    .min(0, "Ngày trong tuần không hợp lệ")
    .max(6, "Ngày trong tuần không hợp lệ"),
  startTime: z.string().refine((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return (
      !isNaN(hours) &&
      !isNaN(minutes) &&
      hours >= 0 &&
      hours < 24 &&
      minutes >= 0 &&
      minutes < 60
    );
  }, "Định dạng giờ không hợp lệ (HH:mm)"),
  duration: z.coerce.number().min(1, "Thời lượng phải lớn hơn hoặc bằng 1"),
  durationUnit: z.enum(["Minutes", "Hours", "Periods"], {
    message: "Đơn vị thời lượng không được để trống",
  }),
  location: z.string().nullable().optional(),
}) satisfies z.ZodType<Partial<ScheduleDto>, any, any>;

export type ScheduleItemFormInput = z.input<typeof scheduleItemSchema>;
export type ScheduleItemFormValues = z.output<typeof scheduleItemSchema>;

export const defaultScheduleItemValues: ScheduleItemFormInput = {
  dayOfWeek: 1,
  startTime: "08:00",
  duration: 60,
  durationUnit: "Minutes",
  location: "",
};

// --- Routine ---

export const routineSchema = z.object({
  name: z
    .string()
    .min(1, "Tên hoạt động không được để trống")
    .max(200, "Tên hoạt động không được vượt quá 200 ký tự"),
  description: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  type: z.enum(["ClassSession", "SelfStudy", "AssignmentWork", "LifeHabit"], {
    message: "Loại hoạt động không được để trống",
  }),
  courseId: z.coerce.number().nullable().optional(),
  eventRequirementId: z.coerce.number().nullable().optional(),
  schedules: z.array(scheduleItemSchema).nullable().optional(),
}) satisfies z.ZodType<Partial<Record<keyof RequestRoutineDto, any>>, any, any>;

export type RoutineFormInput = z.input<typeof routineSchema>;
export type RoutineFormValues = z.output<typeof routineSchema>;

export const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1,"Giờ bắt đầu không được để trống"), // "08:00"
  duration: z.number().min(1),
  location: z.string().optional(),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;