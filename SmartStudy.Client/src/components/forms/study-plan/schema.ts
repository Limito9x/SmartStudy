import z from "zod";
import type { RequestStudyPlanDto } from "@/services/api";

export const studyPlanSchema = z
  .object({
    name: z.string().min(1, "Tên kế hoạch học tập không được để trống"),
    startDate: z.string().min(1, "Ngày bắt đầu không được để trống"),
    endDate: z.string().min(1, "Ngày kết thúc không được để trống"),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  }) satisfies z.ZodType<Partial<RequestStudyPlanDto>, any, any>;

export type StudyPlanFormValues = z.infer<typeof studyPlanSchema>;
