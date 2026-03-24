import z from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1, "Tên môn học không được để trống"),
  code: z.string().nullable(),
  credits: z.number().int().positive("Số tín chỉ phải là số nguyên dương").nullable(),
  type: z.enum(["Academic", "Personal"]).default("Academic"),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;

export const bulkSubjectSchema = z.object({
  subjects: z.array(subjectSchema).min(1, "Phải có ít nhất một môn học"),
});

export type BulkSubjectFormValues = z.infer<typeof bulkSubjectSchema>;