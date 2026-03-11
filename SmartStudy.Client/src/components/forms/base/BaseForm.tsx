import {
  useForm,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import type { ZodType } from "zod";

interface BaseFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void;
  // Kỹ thuật Render Props: Cho phép component con truy cập vào methods của form
  children: (methods: UseFormReturn<T>) => React.ReactNode;
  formId?: string; // Thêm formId để liên kết với nút submit bên ngoài form
}

export function BaseForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: BaseFormProps<T>) {
  const methods = useForm<T, unknown, T>({
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  return (
    <Form {...methods}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
            methods.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
      >
        {children(methods as UseFormReturn<T>)}
      </form>
    </Form>
  );
}
