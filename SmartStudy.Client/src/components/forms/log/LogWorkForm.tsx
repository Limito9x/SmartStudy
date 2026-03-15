import { logSchema, type LogFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import { FormInput, FormSelect } from "@/components/form-controls";
import { BaseFormField } from "@/components/form-controls/BaseFormField";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LogWorkFormProps {
  onSubmit: (data: LogFormValues) => void;
  defaultValues?: Partial<LogFormValues>;
}

export function LogWorkForm({ onSubmit, defaultValues }: LogWorkFormProps) {
  return (
    <BaseForm
      schema={logSchema}
      defaultValues={{
        markAsCompleted: false,
        ...defaultValues,
      }}
      onSubmit={onSubmit}
    >
      {(methods) => {
        const { control } = methods;
        return (
          <>
            <FormInput
              name="actualDurationMinutes"
              control={control}
              label="Thời gian thực tế (phút)"
              placeholder="Ví dụ: 60"
              type="number"
            />
            <FormSelect
              name="comrehensiveLevel"
              control={control}
              label="Mức độ hiểu bài"
              placeholder="Chọn mức độ"
              valueAsNumber
              options={[
                { value: "3", label: "Hiểu rõ" },
                { value: "2", label: "Hiểu cơ bản" },
                { value: "1", label: "Còn mơ hồ" },
                { value: "0", label: "Chưa hiểu" },
              ]}
            />
            <FormSelect
              name="difficultyLevel"
              control={control}
              label="Độ khó"
              placeholder="Chọn mức độ"
              valueAsNumber
              options={[
                { value: "2", label: "Khó" },
                { value: "1", label: "Vừa" },
                { value: "0", label: "Dễ" },
              ]}
            />
            <BaseFormField
              control={control}
              name="note"
              label="Ghi chú"
              render={(field) => (
                <Textarea
                  placeholder="Ghi lại những gì đã học được..."
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
            <BaseFormField
              control={control}
              name="markAsCompleted"
              label=""
              render={(field) => (
                <div className="flex items-center gap-3">
                  <Switch
                    id="markAsCompleted"
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="markAsCompleted" className="cursor-pointer">
                    Đánh dấu hoàn thành sau khi log
                  </Label>
                </div>
              )}
            />
            <Button type="submit" className="w-full">
              Lưu log
            </Button>
          </>
        );
      }}
    </BaseForm>
  );
}
