import { loginFormSchema, type LoginFormValues } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/apiClient";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await authService.apiAuthLoginPost(data);
      useAuthStore.getState().login(response.data);
      navigate("/app");
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={form.control}
          name="userName"
          label="Tên đăng nhập"
          placeholder="Nhập tên đăng nhập của bạn"
        />
        <FormInput
          control={form.control}
          name="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu của bạn"
          type="password"
        />
        <Button type="submit">Đăng nhập</Button>
      </form>
    </Form>
  );
};
