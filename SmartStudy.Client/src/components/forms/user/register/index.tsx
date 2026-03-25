import { registerSchema, type RegisterFormValues } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { FormInput } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { registerMutation } from "@/services/api/@tanstack/react-query.gen";
import { toast } from "sonner";

export const RegisterForm = () => {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      userName: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutationInstance = useMutation({
    ...registerMutation(),
    onSuccess: () => {
      toast.success("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      form.reset();
    },
    onError: (error) => {
      console.error("Đăng ký thất bại:", error);
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerMutationInstance.mutateAsync({
        body: data,
      });
      form.reset();
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          control={form.control}
          name="email"
          label="Email"
          placeholder="Nhập email của bạn"
        />

        <FormInput
          control={form.control}
          name="userName"
          label="Tên người dùng"
          placeholder="Nhập tên người dùng của bạn"
        />
        <FormInput
          control={form.control}
          name="fullName"
          label="Họ tên"
          placeholder="Nhập họ tên của bạn"
        />
        <FormInput
          control={form.control}
          name="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu của bạn"
          type="password"
        />
        <FormInput
          control={form.control}
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu của bạn"
          type="password"
        />
        <Button type="submit" className="w-full mt-4">
          Đăng ký
        </Button>
      </form>
    </Form>
  );
};
