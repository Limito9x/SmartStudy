import z from "zod";
import type { RequestCourseDto } from "@/services/api";

export const courseSchema = z.object({
  subjectId: z.number().min(1, "Môn học không được để trống"),
  mentor: z
    .string()
    .min(1, "Tên giảng viên không được để trống")
    .max(100, "Tên giảng viên không được vượt quá 100 ký tự"),
  alternativeName: z.string().nullable(),
  targetScore: z.coerce
    .number()
    .min(0, "Điểm mục tiêu phải lớn hơn hoặc bằng 0")
    .max(10, "Điểm mục tiêu không được vượt quá 10")
    .nullish(),
  finalScore: z.coerce
    .number()
    .min(0, "Điểm tổng kết phải lớn hơn hoặc bằng 0")
    .max(10, "Điểm tổng kết không được vượt quá 10")
    .nullish(),
}) satisfies z.ZodType<Partial<RequestCourseDto>, any, any>;

export type CourseFormValues = z.infer<typeof courseSchema>;
