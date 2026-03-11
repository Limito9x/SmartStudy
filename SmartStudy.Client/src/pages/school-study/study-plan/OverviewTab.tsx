import { useState } from "react";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/features/course/CourseCard";
import { useCourse } from "@/hooks/entities/useCourse";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CourseForm from "@/components/forms/course/CourseForm";
import type { CourseFormValues } from "@/components/forms/course/schema";
import { useNavigate } from "react-router-dom";
import { courseApiMapper } from "@/utils/mapper.ts/apiMapper";
import { courseFormMapper } from "@/utils/mapper.ts/formMapper";
import { useDialogStore } from "@/stores/useDialogStore";
import ConfirmDelete from "@/components/ui/common/ConfirmDelete";

interface DraftStudyPlanProps {
  studyPlanId: number;
}

interface CourseSheetProps {
  courseId?: number;
  title: string;
  formDefaultValues?: CourseFormValues;
  onSubmit: (data: CourseFormValues) => void;
}

const FORM_DEFAULT_VALUES: CourseFormValues = {
  subjectId: undefined as unknown as number,
  mentor: "",
  alternativeName: "",
  targetScore: undefined,
  finalScore: undefined,
};

export default function DraftStudyPlan({ studyPlanId }: DraftStudyPlanProps) {
  const navigate = useNavigate();
  const courseApi = useCourse({ studyPlanId });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetState, setSheetState] = useState<CourseSheetProps>({
    title: "Thêm lớp học phần",
    formDefaultValues: FORM_DEFAULT_VALUES,
    onSubmit: () => {},
  });
  const { openDialog, closeDialog } = useDialogStore();

  const { data: courses } = courseApi.getCoursesByStudyPlan;

  const createCourseMutation = courseApi.createCourse;
  const updateCourseMutation = courseApi.updateCourse;
  const deleteCourseMutation = courseApi.deleteCourse;

  const handleCreateCourse = async (courseData: CourseFormValues) => {
    try {
      const payload = courseApiMapper.toRequestCourseDto(
        courseData,
        studyPlanId,
      );

      await createCourseMutation.mutateAsync({ body: payload });
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  const handleUpdateCourse = async (
    courseData: CourseFormValues,
    courseId: number,
  ) => {
    try {
      const payload = courseApiMapper.toRequestCourseDto(
        courseData,
        studyPlanId,
      );

      await updateCourseMutation.mutateAsync({
        body: payload,
        path: {
          courseId,
        },
      });
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      const course = courses?.find((c) => c.id === courseId);
      if (!course) {
        alert("Không tìm thấy lớp học phần");
        return;
      }
      openDialog({
        title: "Xác nhận xóa",
        view: (
          <ConfirmDelete
            message={`Bạn có chắc chắn muốn xóa lớp học phần "${course.subjectName}" không? Hành động này không thể hoàn tác.`}
            onConfirm={async () => {
              await deleteCourseMutation.mutateAsync({
                path: {
                  courseId,
                },
              });
              closeDialog();
            }}
            onCancel={closeDialog}
          />
        ),
      });
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  const openCreateCourseSheet = () => {
    setSheetState({
      title: "Thêm lớp học phần",
      onSubmit: handleCreateCourse,
      formDefaultValues: FORM_DEFAULT_VALUES,
    });
    setIsSheetOpen(true);
  };

  const openEditCourseSheet = (courseId: number) => {
    const course = courses?.find((c) => c.id === courseId);
    if (!course) {
      alert("Không tìm thấy lớp học phần");
      return;
    }
    setSheetState({
      title: "Chỉnh sửa lớp học phần",
      formDefaultValues: courseFormMapper.toFormValues(course),
      onSubmit: (data) => handleUpdateCourse(data, courseId),
    });
    setIsSheetOpen(true);
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Danh sách lớp học phần</h2>
        <Button variant="outline" onClick={() => openCreateCourseSheet()}>
          Thêm lớp học phần
        </Button>
      </div>
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => openEditCourseSheet(Number(course.id))}
              onDelete={() => handleDeleteCourse(Number(course.id))}
              onView={() => navigate(`courses/${course.id}`)}
            />
          ))}
        </div>
      ) : (
        <div>
          Chưa có lớp học phần nào trong kế hoạch học tập này. Hãy thêm lớp học
          phần để bắt đầu lên kế hoạch học tập của bạn!
        </div>
      )}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-lg p-4">
          <SheetHeader>
            <SheetTitle>{sheetState.title}</SheetTitle>
          </SheetHeader>
          <CourseForm
            defaultValues={sheetState.formDefaultValues}
            onSubmit={sheetState.onSubmit}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
