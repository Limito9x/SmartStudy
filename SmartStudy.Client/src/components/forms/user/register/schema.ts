import type { UserRegisterDto } from "@/services/api";
import z from "zod";

export const registerSchema = z
  .object({
    email: z.email("Email không hợp lệ"),
    userName: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
    fullName: z.string().min(3, "Họ tên phải có ít nhất 3 ký tự"),
    password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .regex(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~;])/,
        "Mật khẩu phải chứa ít nhất một chữ in hoa và một ký tự đặc biệt",
      ),
    confirmPassword: z
      .string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  }) satisfies z.ZodType<Record<keyof UserRegisterDto, any>>;

  export type RegisterFormValues = z.infer<typeof registerSchema>;