import z from "zod";

export const logSchema = z.object({
  note: z.string().nullable().optional(),
  actualDuration: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce
      .number()
      .min(1, "Thời lượng thực tế phải từ 1 phút trở lên")
      .optional()
  ),
  comprehensionLevel: z.coerce
    .number()
    .min(0, "Mức độ hiểu bài phải lớn hơn hoặc bằng 0")
    .max(3, "Mức độ hiểu bài không được vượt quá 3")
    .nullable()
    .optional(),
  difficultyLevel: z.coerce
    .number()
    .min(0, "Mức độ khó phải lớn hơn hoặc bằng 0")
    .max(2, "Mức độ khó không được vượt quá 2")
    .nullable()
    .optional(),
  timerStartAt: z.string().nullable().optional(),
  timerEndAt: z.string().nullable().optional(),
  files: z.array(z.any()).optional().default([]),
  markAsCompleted: z.boolean({
    message: "Trạng thái hoàn thành không được để trống",
  }),
});

export type LogFormValues = z.infer<typeof logSchema>;
