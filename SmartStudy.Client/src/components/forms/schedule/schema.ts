import z from "zod";

export const scheduleSchema = z.object({
  frequency: z.union([
    z.literal("Daily"),
    z.literal("Weekly"),
    z.literal("Monthly"),
    z.literal("Yearly"), // Các kiểu để hờ, chủ yếu là weekly
  ]),
  interval: z.number().min(1, "Interval must be at least 1"),
  dayOfWeek: z.number().min(0).max(6), // 0 -> Sunday, 6 -> Saturday
  daysOfMonth: z
    .array(z.union([z.string(), z.number()]))
    .nullable()
    .optional(),
  startTime: z.string().refine((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return (
      !isNaN(hours) &&
      !isNaN(minutes) &&
      hours >= 0 &&
      hours < 24 &&
      minutes >= 0 &&
      minutes < 60
    );
  }, "Định dạng giờ không hợp lệ"),
  duration: z.number().min(1, "Duration must be at least 1"),
  durationUnit: z.union([
    z.literal("Minutes"),
    z.literal("Hours"),
    z.literal("Periods"),
  ]),
  location: z.string().optional(),
  ownerType: z.union([z.literal("Course"), z.literal("Routine")]),
  ownerId: z.string(),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
