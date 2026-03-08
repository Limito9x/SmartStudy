import z from "zod";
import type { EventRequirementReqDto } from "@/services/api";

export const eventRequirementSchema = z.object({
  name: z
    .string()
    .min(1, "Tên yêu cầu không được để trống")
    .max(200, "Tên yêu cầu không được vượt quá 200 ký tự"),
  expectedValue: z.coerce
    .number()
    .min(0, "Giá trị kỳ vọng phải lớn hơn hoặc bằng 0"),
  unit: z.string().min(1, "Đơn vị không được để trống"),
  strategy: z.enum(["Additive", "Averaging", "MaxValue", "TaskBased"], {
    message: "Chiến lược tính toán không được để trống",
  }),
  timelineEventId: z.coerce.number().min(1, "Sự kiện không được để trống"),
}) satisfies z.ZodType<Partial<EventRequirementReqDto>, any, any>;

export type EventRequirementFormValues = z.infer<typeof eventRequirementSchema>;
