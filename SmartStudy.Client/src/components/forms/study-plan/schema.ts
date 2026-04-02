import z from "zod";

export const studyPlanSchema = z
  .object({
    name: z.string(),
    startDate: z.date().min(new Date(1900, 0, 1), "Ngày bắt đầu không hợp lệ"),
    endDate: z.date().min(new Date(1900, 0, 1), "Ngày kết thúc không hợp lệ"),
    termId: z.coerce.number().nullable(),
    yearId: z.coerce.number().nullable(),
    type: z.enum(["Academic", "Personal"]).default("Academic"),
  })
  // 1. Refine cũ: Check ngày tháng
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  })
  // 2. Refine mới: Check Học kỳ (Term) nếu là Đại học
  .refine(
    (data) => {
      if (data.type === "Academic") {
        return data.termId !== null && data.termId !== undefined;
      }
      return true; // Nếu là Personal thì không cần check, cho qua luôn
    },
    {
      message: "Vui lòng chọn Học kỳ cho kế hoạch Đại học",
      path: ["termId"], // Bắn lỗi đỏ chót ngay dưới ô chọn Học kỳ
    },
  )
  // 3. Refine mới: Check Năm học (Year) nếu là Đại học
  .refine(
    (data) => {
      if (data.type === "Academic") {
        return data.yearId !== null && data.yearId !== undefined;
      }
      return true;
    },
    {
      message: "Vui lòng chọn Năm học cho kế hoạch Đại học",
      path: ["yearId"], // Bắn lỗi đỏ chót ngay dưới ô chọn Năm học
    },
  )
  .refine(
    (data) => {
      if (data.type === "Personal") {
        return data.name.trim().length > 0; // Tên KHHT cá nhân không được để trống
      }
      return true; // Nếu là Academic thì không cần check, cho qua luôn
    },
    {
      message: "Tên kế hoạch học tập không được để trống",
    }
  );

export type StudyPlanFormValues = z.infer<typeof studyPlanSchema>;
