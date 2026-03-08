import z from "zod";
import type { RequestCourseDto } from "@/services/api";

export const courseSchema = z.object({
  studyPlanId: z.coerce.number().min(1, "Kế hoạch học tập không được để trống"),
  subjectId: z.coerce.number().min(1, "Môn học không được để trống"),
  targetScore: z.coerce
    .number()
    .min(0, "Điểm mục tiêu phải lớn hơn hoặc bằng 0")
    .max(10, "Điểm mục tiêu không được vượt quá 10")
    .nullable()
    .optional(),
  finalScore: z.coerce
    .number()
    .min(0, "Điểm tổng kết phải lớn hơn hoặc bằng 0")
    .max(10, "Điểm tổng kết không được vượt quá 10")
    .nullable()
    .optional(),
}) satisfies z.ZodType<Partial<RequestCourseDto>, any, any>;

export type CourseFormValues = z.infer<typeof courseSchema>;
