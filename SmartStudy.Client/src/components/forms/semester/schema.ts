import type { RequestSemesterDto } from "@/services/api/api";
import z from "zod";

export const baseSemesterSchema = z.object({
  term: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  year: z.number().min(2000, "Năm phải lớn hơn hoặc bằng 2000"),
  startDate: z.date(),
  endDate: z.date(),
});

export const semesterSchema = baseSemesterSchema.refine((data) => data.startDate < data.endDate, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"],
}) satisfies z.ZodType<Partial<Record<keyof RequestSemesterDto, any>>>;

export type SemesterFormValues = z.infer<typeof semesterSchema>;
