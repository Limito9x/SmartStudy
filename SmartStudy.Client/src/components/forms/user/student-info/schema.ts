import z from "zod";
import type { StudentInfoDto } from "@/services/api";

export const settingSchema = z.object({
  // 1. Thông tin cá nhân
  university: z.string().min(1, "Tên trường đại học không được để trống"),
  major: z.string().min(1, "Ngành học không được để trống"),
  cohort: z.string().min(1, "Khóa học không được để trống"),
  // 2. Tổ chức chương trình đào tạo
  admissionDate: z.date({
    error:"Ngày nhập học không hợp lệ",
  }),
  semestersPerYear: z
    .number()
    .int()
    .min(1, "Số học kỳ mỗi năm phải lớn hơn 0")
    .max(3, "Số học kỳ mỗi năm phải nhỏ hơn hoặc bằng 3"),
  weeksPerSemester: z
    .number()
    .min(1, "Số tuần mỗi học kỳ chính phải lớn hơn 0"),
  weeksOfSummerSemester: z
    .number()
    .min(0, "Số tuần học kỳ hè phải lớn hơn hoặc bằng 0")
    .nullable(),
  programLength: z.number().min(1, "Thời gian đào tạo phải lớn hơn 0"),
  // 3. Nhóm thông tin tùy chọn
  totalRequiredCredits: z
    .number()
    .min(1, "Tổng số tín chỉ cần thiết phải lớn hơn 0")
    .nullable()
    .optional(),
  creditsPerSemester: z
    .number()
    .min(1, "Số tín chỉ mỗi học kỳ phải lớn hơn 0")
    .nullable()
    .optional(),
  creditsPerSummerSemester: z
    .number()
    .min(1, "Số tín chỉ mỗi học kỳ hè phải lớn hơn 0")
    .nullable()
    .optional(),
} satisfies Partial<Record<keyof StudentInfoDto, any>>) satisfies z.ZodType<
  Partial<StudentInfoDto>,
  any,
  any
>;

export type SettingFormValues = z.infer<typeof settingSchema>;
