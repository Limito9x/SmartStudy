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
            <FormCombobox<CourseFormValues, ResponseSubjectDto>
              control={courseForm.control}
              name="subjectId"
              label="Môn học"
              placeholder={
                isLoading ? "Đang tải danh sách môn học..." : "Chọn môn học"
              }
              options={subjects}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id.toString()}
              disabled={isLoading}
              valueAsNumber
              notFoundContent={(inputText) => (
                <div className="p-2 text-sm text-muted-foreground">
                  Không tìm thấy môn học nào cho "{inputText}"
                  <Separator className="my-2" />
                  <QuickCreateSubject name={inputText} />
                </div>
              )}
              emptyText="Không tìm thấy môn học phù hợp"
              renderOption={(option) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="truncate">{option.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {option.credits} tín chỉ
                  </span>
                </div>
              )}
              onSearchChange={(val) => setSearchTerm(val)}
            />

            <FormInput
              control={courseForm.control}
              name="mentor"
              label="Tên giảng viên"
              placeholder="Nhập tên giảng viên"
            />
            <FormInput
              control={courseForm.control}
              name="alternativeName"
              label="Tên lớp học phần (nếu có)"
              placeholder="Nhập tên lớp học phần (nếu có)"
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
