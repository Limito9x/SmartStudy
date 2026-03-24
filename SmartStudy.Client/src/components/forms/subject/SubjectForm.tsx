import { BaseForm } from "../base/BaseForm";
import { subjectSchema, type SubjectFormValues } from "./schema";
import { FormInput } from "@/components/form-controls";
import { Button } from "@/components/ui/button";

interface SubjectFormProps {
  isEditMode?: boolean;
  defaultValues?: SubjectFormValues;
  onSubmit: (data: SubjectFormValues) => void;
  onCancel?: () => void;
}

export default function SubjectForm({
  isEditMode = false,
  defaultValues,
  onSubmit,
  onCancel,
}: SubjectFormProps) {
  return (
    <BaseForm
      schema={subjectSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      children={(methods) => {
        const control = methods.control;
        const isAcademic = methods.watch("type") === "Academic";
        return (
          <>
            <FormInput
              name="name"
              control={control}
              label="Tên môn học"
              placeholder="Nhập tên môn học"
            />
            {isAcademic && (
              <>
                <FormInput
                  name="code"
                  control={control}
                  label="Mã môn học"
                  placeholder="Nhập mã môn học (nếu có)"
                />
                <FormInput
                  name="credits"
                  control={control}
                  label="Số tín chỉ"
                  type="number"
                  placeholder="Nhập số tín chỉ"
                />
              </>
            )}
            <Button type="submit">
              {isEditMode ? "Cập nhật môn học" : "Tạo môn học"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
          </>
        );
      }}
    />
  );
}
