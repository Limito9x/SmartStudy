import z from "zod";
import type { RequestSubjectDto } from "@/services/api";

export const subjectSchema = z.object({
  name: z.string().min(1, "Tên môn học không được để trống"),
  credits: z.coerce.number().min(0, "Số tín chỉ phải là số dương"),
  type: z.enum(["Theory", "Practice", "Project", "Thesis"], {
    message: "Loại môn học không được để trống",
  }),
}) satisfies z.ZodType<Partial<RequestSubjectDto>, any, any>;

export type SubjectFormValues = z.infer<typeof subjectSchema>;
