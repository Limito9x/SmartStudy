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
  studyPlans: z.array(
    z.object({
      academicTermId: z.number().min(1),
      academicYearId: z.number().min(1),
      startDate: z.string().min(1),
      endDate: z.string().min(1),
    }),
  ),
});

export type SettingFormValues = z.infer<typeof settingSchema>;
