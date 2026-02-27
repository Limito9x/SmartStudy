import z from "zod";
import type { UserLoginDto } from "@/services/api";

export const loginFormSchema = z.object({
  userName: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
}) satisfies z.ZodType<UserLoginDto>;

export type LoginFormValues = z.infer<typeof loginFormSchema>;
