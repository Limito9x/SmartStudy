import { z } from "zod";

export const routineSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập tên lịch trình"),
    description: z.string().optional(),
    type: z.enum(["ClassSession", "SelfStudy", "AssignmentWork", "Meeting"]),
    courseId: z.number().optional(),
    startDate: z.string().optional(), // ISO date string
    endDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: "custom",
        message: "Ngày kết thúc phải sau ngày bắt đầu",
        path: ["endDate"],
      });
    }
  });

export type RoutineFormValues = z.infer<typeof routineSchema>;
