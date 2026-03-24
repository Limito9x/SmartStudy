import { BaseForm } from "../base/BaseForm";
import { bulkSubjectSchema, type BulkSubjectFormValues } from "./schema";
import { FormInput } from "@/components/form-controls";
import { Button } from "@/components/ui/button";
import { useFieldArray } from "react-hook-form";
import { Trash } from "lucide-react";

interface SubjectFormProps {
  type: "Academic" | "Personal";
  onSubmit: (data: BulkSubjectFormValues) => void;
  onCancel?: () => void;
}

export default function BulkSubjectForm({ type, onSubmit, onCancel }: SubjectFormProps) {
  const isAcademic = type === "Academic";
  return (
    <BaseForm
      schema={bulkSubjectSchema}
      defaultValues={{
        subjects: [
          {
            name: "",
            code: "",
            credits: null,
            type,
          },
        ],
      }}
      onSubmit={onSubmit}
      children={(methods) => {
        const control = methods.control;
        const { fields, append, remove } = useFieldArray({
          control,
          name: "subjects",
        });
        return (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border p-4 rounded mb-4 flex justify-between items-center gap-5"
              >
                {isAcademic && (
                  <FormInput
                    name={`subjects.${index}.code`}
                    control={control}
                    label={`Mã môn học #${index + 1}`}
                    placeholder="Nhập mã môn học (nếu có)"
                  />
                )}
                <FormInput
                  name={`subjects.${index}.name`}
                  control={control}
                  label={`Tên môn học #${index + 1}`}
                  placeholder="Nhập tên môn học"
                />
                {isAcademic && (
                  <FormInput
                    name={`subjects.${index}.credits`}
                    control={control}
                    label={`Số tín chỉ #${index + 1}`}
                    type="number"
                    placeholder="Nhập số tín chỉ"
                  />
                )}
                <Button
                  type="button"
                  size={"icon-sm"}
                  variant="destructive"
                  onClick={() => {
                    if (fields.length > 1) {
                      remove(index);
                    }
                  }}
                  className="mt-2"
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={() =>
                append({ name: "", code: "", credits: null, type })
              }
              className="mb-4"
            >
              Thêm môn học khác
            </Button>
            <div className="flex gap-2">
              <Button type="submit">Tạo môn học</Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
            </div>
          </div>
        );
      }}
    />
  );
}
