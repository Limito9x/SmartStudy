import { BaseForm } from "../base/BaseForm";
import { subjectSchema, type SubjectFormValues } from "./schema";
import { FormInput, FormSelect } from "@/components/form-controls";
import { Button } from "@/components/ui/button";

interface SubjectFormProps {
  defaultValues?: SubjectFormValues;
  onSubmit: (data: SubjectFormValues) => void;
  onCancel?: () => void;
}

export default function SubjectForm({
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
        return (
          <>
            <FormInput
              name="name"
              control={control}
              label="Tên môn học"
              placeholder="Nhập tên môn học"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="credits"
                control={control}
                label="Số tín chỉ"
                type="number"
                placeholder="Nhập số tín chỉ"
              />
              <FormSelect
                name="type"
                control={control}
                label="Loại môn học"
                placeholder="Chọn loại môn học"
                options={[
                  { label: "Lý thuyết", value: "Theory" },
                  { label: "Thực hành", value: "Practice" },
                  { label: "Đồ án", value: "Project" },
                  { label: "Luận văn", value: "Thesis" },
                ]}
              />
            </div>

            <Button type="submit">
              Lưu
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Hủy
            </Button>
          </>
        );
      }}
    />
  );
}
