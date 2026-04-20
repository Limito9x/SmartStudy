import z from "zod";
import type { RequestCourseDto } from "@/services/api";

export const courseSchema = z.object({
  name: z.string().min(1, "Tên lớp học phần không được để trống"),
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
  goal: z.string().nullable(),
  color: z.string().nullable(),
  subjectId: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const numericValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numericValue) ? numericValue : value;
  }, z.number().int().positive().nullable()),
}) satisfies z.ZodType<Partial<RequestCourseDto>, any, any>;

export type CourseFormValues = z.infer<typeof courseSchema>;
