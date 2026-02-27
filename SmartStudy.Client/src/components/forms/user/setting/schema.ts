import type { UserSettingDto } from "@/services/api";
import { baseSemesterSchema } from "../../semester/schema";
import z from "zod";

export const settingSchema = z.object({
  admissionDate: z.date(),
  semestersPerYear: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  weeksPerSemester: z
    .number()
    .min(1, "Số tuần mỗi học kỳ chính phải lớn hơn 0"),
  weeksOfSummerSemester: z
    .number()
    .min(0, "Số tuần học kỳ hè phải lớn hơn hoặc bằng 0")
    .nullable(),
  programLength: z.number().min(1, "Thời gian đào tạo phải lớn hơn 0"),
  semesters: z.array(
    baseSemesterSchema.pick({
      term: true,
      year: true,
      startDate: true,
      endDate: true,
    }),
  ),
}) satisfies z.ZodType<Record<keyof UserSettingDto, any>>;

export type SettingFormValues = z.infer<typeof settingSchema>;
