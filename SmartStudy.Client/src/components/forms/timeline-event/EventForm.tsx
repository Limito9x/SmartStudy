import { timelineEventSchema, type TimelineEventFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import {
  FormInput,
  FormSelect,
  FormDatePicker,
} from "@/components/form-controls";
import { Button } from "@/components/ui/button";

interface EventFormProps {
  defaultValues?: TimelineEventFormValues;
  onSubmit: (data: TimelineEventFormValues) => void;
}

export const EventForm = ({ defaultValues, onSubmit }: EventFormProps) => {
  return (
    <BaseForm
      schema={timelineEventSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      children={(methods) => {
        const control = methods.control;
        return (
          <>
            <FormInput
              name="title"
              control={control}
              label="Tiêu đề sự kiện"
              placeholder="Nhập tiêu đề sự kiện"
            />
            <FormSelect
              name="type"
              control={control}
              label="Loại sự kiện"
              placeholder="Chọn loại sự kiện"
              options={[
                { label: "Nộp bài", value: "Assignment" },
                { label: "Thi cử", value: "Exam" },
                { label: "Thuyết trình", value: "Presentation" },
                { label: "Khác", value: "Other" },
              ]}
            />
            <FormSelect
              name="priority"
              control={control}
              label="Mức độ ưu tiên"
              placeholder="Chọn mức độ ưu tiên"
              options={[
                { label: "Cao", value: "3" },
                { label: "Vừa", value: "2" },
                { label: "Thấp", value: "1" },
              ]}
            />
            <FormDatePicker
              name="dueDate"
              control={control}
              label="Ngày deadline"
              placeholder="Chọn ngày deadline"
              minDate={new Date()}
            />

            <Button type="submit">Lưu</Button>
          </>
        );
      }}
    />
  );
};
