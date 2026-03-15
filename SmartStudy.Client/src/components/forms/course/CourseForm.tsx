import { courseSchema, type CourseFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import { FormCombobox, FormInput } from "@/components/form-controls";
import { useSubject } from "@/hooks/entities/useSubject";
import type { ResponseSubjectDto } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import QuickCreateSubject from "@/components/features/subject/QuickCreateSubject";
import { useId, useState } from "react";
import { Separator } from "@/components/ui/separator";

interface CourseFormProps {
  defaultValues?: Partial<CourseFormValues>;
  onSubmit: (values: CourseFormValues) => void;
}

export default function CourseForm({
  defaultValues,
  onSubmit,
}: CourseFormProps) {
  const subjectApi = useSubject();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data, isLoading } = subjectApi.getSubjects(
    1,
    10,
    debouncedSearchTerm,
  );
  const subjects = data?.items || [];

  return (
    <BaseForm
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      schema={courseSchema}
      children={(courseForm) => {
        return (
          <>
            <FormInput
              name="name"
              control={courseForm.control}
              label="Tên lớp học phần"
              placeholder="Nhập tên lớp học phần"
            />
            <Button variant="default" type="submit">
              Lưu thông tin lớp học phần
            </Button>
          </>
        );
      }}
    />
  );
}
