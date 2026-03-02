import z from "zod";
import { type RequestCourseDto } from "@/services/api";

export const courseSchema = z.object({
  name: z.string().min(1, "Tên lớp học phần không được để trống"),
  credits: z.number().min(0, "Số tín chỉ phải là số dương"),
}) satisfies z.ZodType<Partial<RequestCourseDto>, any, any>;

export type CourseFormValues = z.infer<typeof courseSchema>;
