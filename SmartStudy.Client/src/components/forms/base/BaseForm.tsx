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
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {children(methods as UseFormReturn<T>)}
      </form>
    </Form>
  );
}
