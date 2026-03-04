import { scheduleSchema, type ScheduleFormValues } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormInput, FormSelect } from "@/components/form-controls";
import { Button } from "@/components/ui/button";

interface ScheduleFormProps {
  onSubmit: (data: ScheduleFormValues) => void;
  defaultValues?: Partial<ScheduleFormValues>;
}

export const ScheduleForm = ({
  onSubmit,
  defaultValues,
}: ScheduleFormProps) => {
  const baseDefaultValues: ScheduleFormValues = {
    frequency: "Weekly",
    interval: 1,
    dayOfWeek: 0,
    daysOfMonth: [],
    startTime: "08:00",
    duration: 1,
    durationUnit: "Hours",
    location: "",
    ownerType: "Course",
    ownerId: "",
  };
  const mergedDefaultValues = { ...baseDefaultValues, ...defaultValues };

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: mergedDefaultValues,
  });
  const control = form.control;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="duration"
          control={control}
          label="Thời lượng"
          type="number"
        />
        <FormSelect
          name="durationUnit"
          control={control}
          label="Đơn vị thời lượng"
          options={[
            { label: "Phút", value: "Minutes" },
            { label: "Giờ", value: "Hours" },
            { label: "Tiết", value: "Periods" },
          ]}
        />
        <FormInput name="location" control={control} label="Địa điểm" />
        <Button type="submit">Lưu lịch</Button>
      </form>
    </Form>
  );
};
