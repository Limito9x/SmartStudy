import z from "zod";
import type { LogWorkDto } from "@/services/api";

export const logSchema = z.object({
  note: z.string().nullable().optional(),
  actualDuration: z.coerce
    .number()
    .min(1, "Thời lượng thực tế phải lớn hơn hoặc bằng 1 phút")
    .nullable()
    .optional(),
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
  assetIds: z.array(z.coerce.number()).nullable().optional(),
  markAsCompleted: z.boolean({
    message: "Trạng thái hoàn thành không được để trống",
  }),
}) satisfies z.ZodType<Partial<LogWorkDto>, any, any>;

export type LogFormValues = z.infer<typeof logSchema>;
