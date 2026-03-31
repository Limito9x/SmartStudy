import { BaseForm } from "../base/BaseForm";
import { studyPlanSchema } from "./schema";
import { FormInput, FormDatePicker } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { type StudyPlanFormValues } from "./schema";
import FormAcademicContext from "@/components/form-controls/FormAcademicContext";
import {  useWatch } from "react-hook-form";

interface StudyPlanFormProps {
  defaultValues?: Partial<StudyPlanFormValues>;
  isEditMode?: boolean;
  onSubmit: (values: StudyPlanFormValues) => void;
}

export default function StudyPlanForm({
  defaultValues,
  isEditMode = false,
  onSubmit,
}: StudyPlanFormProps) {
  return (
    <BaseForm
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      schema={studyPlanSchema}
      children={(methods) => {
        const type = useWatch({
          control: methods.control,
          name: "type",
        });

        return (
          <div className="space-y-4">
            {type === "Personal" && (
              <FormInput
                name="name"
                control={methods.control}
                label="Tên kế hoạch học tập"
                placeholder="Nhập tên kế hoạch học tập"
              />
            )}
            {type === "Academic" && (
              <FormAcademicContext
                control={methods.control}
                setValue={methods.setValue}
                termName="termId"
                yearName="yearId"
              />
            )}
            <FormDatePicker
              name="startDate"
              control={methods.control}
              label="Ngày bắt đầu"
              placeholder="Chọn ngày bắt đầu"
            />
            <FormDatePicker
              name="endDate"
              control={methods.control}
              label="Ngày kết thúc"
              placeholder="Chọn ngày kết thúc"
            />
            <Button type="submit" className="mt-4">
              {isEditMode ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        );
      }}
    />
  );
}