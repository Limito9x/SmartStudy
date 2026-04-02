import { useCourse } from "@/hooks/entities/useCourse"; // File useCourse.ts của bác
import CourseForm from "@/components/forms/course/CourseForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Skeleton } from "@/components/ui/skeleton";
import { type DialogDataMap } from "@/stores/useDialogStore";
import type { CourseFormValues } from "@/components/forms/course/schema";
import { courseApiMapper } from "@/utils/mapper.ts/apiMapper";
import { courseFormMapper } from "@/utils/mapper.ts/formMapper";

export default function CourseFormContainer() {
  const { data, closeDialog } = useDialogStore();
  const { type, studyPlanId, courseId, defaultValues } =
    data as DialogDataMap["COURSE_FORM"];

  const isEditMode = !!courseId;
  const { getCourseById, createCourse, updateCourse } = useCourse({
    studyPlanId,
  });

  // NẾU LÀ EDIT: Fetch data ngầm.
  const { data: CourseData, isLoading } = getCourseById(courseId!);

  // NẾU LÀ EDIT MÀ DATA CHƯA VỀ -> HIỆN KHUNG XƯƠNG LOADING
  if (isEditMode && isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Chập data mồi (Create) hoặc data fetch được (Edit) vào form
  const finalDefaultValues =
    isEditMode && CourseData
      ? courseFormMapper.toFormValues(CourseData) // Map lại chuẩn form nếu cần
      : {
          ...defaultValues,
          name: defaultValues?.name || "",
          color: defaultValues?.color || "#ef4444",
          targetScore: defaultValues?.targetScore,
          finalScore: defaultValues?.finalScore,
          goal: defaultValues?.goal || "",
        };

  const handleSubmit = (values: CourseFormValues) => {
    if (isEditMode) {
      updateCourse.mutate(
        {
          path: { courseId: courseId! },
          body: courseApiMapper.toRequestCourseDto(values, studyPlanId),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    } else {
      createCourse.mutate(
        {
          body: courseApiMapper.toRequestCourseDto(values, studyPlanId),
        },
        {
          onSuccess: () => closeDialog(),
        },
      );
    }
  };

  return (
    <CourseForm
      type={type}
      isEditMode={isEditMode}
      defaultValues={finalDefaultValues}
      onSubmit={handleSubmit}
    />
  );
}
