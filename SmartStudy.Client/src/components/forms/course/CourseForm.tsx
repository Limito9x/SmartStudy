import { courseSchema, type CourseFormValues } from "./schema";
import { BaseForm } from "../base/BaseForm";
import { FormInput, FormCombobox } from "@/components/form-controls";
import { FormColorPicker } from "@/components/form-controls/FormColorPicket";
import { Button } from "@/components/ui/button";
import type { ResponseSubjectDto, StudyPlanType } from "@/services/api";
import { useSubject } from "@/hooks/entities/useSubject";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useWatch } from "react-hook-form";

interface CourseFormProps {
  type: StudyPlanType;
  defaultValues?: Partial<CourseFormValues>;
  isEditMode?: boolean;
  onSubmit: (values: CourseFormValues) => void;
}

export default function CourseForm({
  type,
  defaultValues,
  isEditMode = false,
  onSubmit,
}: CourseFormProps) {

  return (
    <BaseForm
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      schema={courseSchema}
      children={(courseForm) => {
        const [search, setSearach] = useState("");

        const debouncedSearch = useDebounce(search, 300);

        const { data: pagedSubjects } = useSubject().getSubjects({
          pageIndex: 1,
          pageSize: 20,
          search: debouncedSearch,
          type,
        });
        const subjectsOptions = pagedSubjects?.items;

        const selectedSubjectId = useWatch({
          control: courseForm.control,
          name: "subjectId",
        });
        const selectedSubject = subjectsOptions?.find(
          (subject) => Number(subject.id) === Number(selectedSubjectId),
        );

        const courseName = selectedSubject ? selectedSubject.name : "";
        courseForm.setValue("name", courseName, { shouldDirty: true });

        return (
          <>
            <FormCombobox<CourseFormValues, ResponseSubjectDto>
              name="subjectId"
              control={courseForm.control}
              label="Môn học"
              placeholder="Chọn môn học"
              options={subjectsOptions || []}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id!.toString()}
              onSearchChange={(value) => {
                setSearach(value);
              }}
              notFoundContent={(text)=>{
                return(
                  <>
                  <span>Không tìm thấy môn "{text}"</span>
                  </>
                )
              }}
            />
            <FormInput
              name="name"
              control={courseForm.control}
              label="Tên khóa học"
              placeholder="Nhập tên khóa học"
            />
            <FormColorPicker
              name="color"
              control={courseForm.control}
              label="Chọn màu đại diện"
            />
            <Button variant="default" type="submit">
              {isEditMode ? "Cập nhật" : "Tạo khóa học"}
            </Button>
          </>
        );
      }}
    />
  );
}
