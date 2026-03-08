import z from "zod";
import type { ScheduleDto, RequestRoutineDto } from "@/services/api";

// --- Schedule Item (dùng trong Routine) ---

export const scheduleItemSchema = z.object({
  id: z.coerce.number().optional(),
  frequency: z.enum(["Daily", "Weekly", "Monthly", "Yearly"], {
    message: "Tần suất không được để trống",
  }),
  interval: z.coerce.number().min(1, "Chu kỳ lặp phải lớn hơn hoặc bằng 1"),
  dayOfWeek: z.coerce
    .number()
    .min(0, "Ngày trong tuần không hợp lệ")
    .max(6, "Ngày trong tuần không hợp lệ"),
  daysOfMonth: z.array(z.coerce.number()).nullable().optional(),
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

export type ScheduleItemFormValues = z.infer<typeof scheduleItemSchema>;

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

export type RoutineFormValues = z.infer<typeof routineSchema>;
