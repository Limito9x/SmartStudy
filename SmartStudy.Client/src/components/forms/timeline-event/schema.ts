import z from "zod";

export const timelineEventSchema = z.object({
  courseId: z.coerce.number().min(1, "Lớp học phần không được để trống"),
  title: z
    .string()
    .min(1, "Tiêu đề không được để trống")
    .max(200, "Tiêu đề không được vượt quá 200 ký tự"),
  startDateTime: z.date(),
  endDateTime: z.date(),
  isAllDay: z.boolean().default(false),
  type: z.enum(
    ["Exam", "Assignment", "Presentation", "ProjectDeadline", "Other"],
    { message: "Loại sự kiện không được để trống" },
  ),
  priority: z.coerce
    .number()
    .min(1, "Mức độ ưu tiên phải lớn hơn hoặc bằng 1")
    .max(3, "Mức độ ưu tiên không được vượt quá 3"),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type TimelineEventFormValues = z.infer<typeof timelineEventSchema>;
