import { BaseForm } from "../base/BaseForm";
import { subjectSchema, type SubjectFormValues } from "./schema";
import { FormInput, FormSelect } from "@/components/form-controls";
import { Button } from "@/components/ui/button";

interface SubjectFormProps {
  defaultValues?: SubjectFormValues;
  onSubmit: (data: SubjectFormValues) => void;
}

export default function SubjectForm({
  defaultValues,
  onSubmit,
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
            <Button type="submit">Lưu</Button>
          </>
        );
      }}
    />
  );
}
