import z from "zod";
import type { RequestTaskDto } from "@/services/api";

export const taskSchema = z.object({
  name: z
    .string()
    .min(1, "Tên nhiệm vụ không được để trống")
    .max(200, "Tên nhiệm vụ không được vượt quá 200 ký tự"),
  description: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  type: z.enum(["ClassSession", "SelfStudy", "AssignmentWork", "LifeHabit"], {
    message: "Loại nhiệm vụ không được để trống",
  }),
  linkedFormIds: z.array(z.coerce.number()).nullable().optional(),
  courseId: z.coerce.number().nullable().optional(),
}) satisfies z.ZodType<Partial<RequestTaskDto>, any, any>;

export type TaskFormValues = z.infer<typeof taskSchema>;
