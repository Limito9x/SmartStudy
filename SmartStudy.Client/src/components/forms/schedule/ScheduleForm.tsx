import { scheduleSchema, type ScheduleFormValues } from "./schema";
import { FormInput, FormSelect } from "@/components/form-controls";
import { BaseForm } from "../base/BaseForm";
import { Button } from "@/components/ui/button";

interface ScheduleFormProps {
  defaultValues?: Partial<ScheduleFormValues>;
  onSubmit: (values: ScheduleFormValues) => void;
}

export default function ScheduleForm({
  defaultValues,
  onSubmit,
}: ScheduleFormProps) {
  return (
    <BaseForm
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      schema={scheduleSchema}
      children={(methods) => {
        return (
          <>
            <FormInput
              type="time"
              name="startTime"
              control={methods.control}
              label="Thời gian bắt đầu"
              placeholder="Chọn thời gian bắt đầu"
            />
            <FormInput
              type="number"
              name="duration"
              control={methods.control}
              label="Thời lượng"
              placeholder="Nhập thời lượng (phút)"
            />
            <FormInput
                name="location"
                control={methods.control}
                label="Địa điểm (nếu có)"
                placeholder="Nhập địa điểm (nếu có)"
             />
             <Button type="submit" className="mt-4">
              Lưu
            </Button>
          </>
        );
      }}
    />
  );
}
