import z from "zod";

export const settingSchema = z.object({
  // 1. Thông tin cá nhân
  university: z.string().min(1, "Tên trường đại học không được để trống"),
  major: z.string().min(1, "Ngành học không được để trống"),
  cohort: z.string().min(1, "Khóa học không được để trống"),
  termId: z.coerce.number().nullable(),
  yearId: z.coerce.number().nullable(),
  startDate: z.date().min(new Date(1900, 0, 1), "Ngày bắt đầu không hợp lệ"),
  endDate: z.date().min(new Date(1900, 0, 1), "Ngày kết thúc không hợp lệ"),
  admissionYear: z.coerce.number().nullable(),
});

export type SettingFormValues = z.infer<typeof settingSchema>;
