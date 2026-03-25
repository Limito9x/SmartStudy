import { loginFormSchema, type LoginFormValues } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginMutation } from "@/services/api/@tanstack/react-query.gen";
import { toast } from "sonner";

export const LoginForm = () => {
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const mutation = useMutation({
    ...loginMutation(),
    onSuccess: (data) => {
      useAuthStore.getState().login(data);
      navigate("/app");
    },
    onError: (error) => {
      console.error("Đăng nhập thất bại:", error);
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await mutation.mutateAsync({
        body: data,
      });
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
        <Button type="submit" className="w-full mt-2">
          Đăng nhập
        </Button>
      </form>
    </Form>
  );
};
