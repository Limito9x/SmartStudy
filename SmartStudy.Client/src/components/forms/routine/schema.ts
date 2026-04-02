import { z } from "zod";
import { scheduleSchema } from "../schedule/schema";

export const routineSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập tên lịch trình"),
    instructor: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(["ClassSession", "SelfStudy", "AssignmentWork", "Meeting"]),
    courseId: z.number().optional(),
    eventId: z.number().optional(),
    startDate: z.date().nullable().optional(),
    endDate: z.date().nullable().optional(),
    schedules: z.array(scheduleSchema).optional(),
  });

export type RoutineFormValues = z.infer<typeof routineSchema>;
