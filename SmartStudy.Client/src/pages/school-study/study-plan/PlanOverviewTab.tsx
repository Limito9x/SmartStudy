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
import { useNavigate, useParams } from "react-router-dom";
import { courseApiMapper } from "@/utils/mapper.ts/apiMapper";
import { courseFormMapper } from "@/utils/mapper.ts/formMapper";
import { useDialogStore } from "@/stores/useDialogStore";
import ConfirmDelete from "@/components/ui/common/ConfirmDelete";
import { useOutletContext } from "react-router-dom";
import type { StudyPlanOutletContext } from "@/layouts/StudyPlanLayout";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";

interface CourseSheetProps {
  courseId?: number;
  title: string;
  formDefaultValues?: CourseFormValues;
  onSubmit: (data: CourseFormValues) => void;
}

const FORM_DEFAULT_VALUES: CourseFormValues = {
  name: "",
  targetScore: undefined,
  finalScore: undefined,
  goal: "",
};

export default function PlanOverviewTab() {
  const { studyPlanId } = useParams();
  const navigate = useNavigate();
  const courseApi = useCourse({
    studyPlanId: Number(studyPlanId),
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetState, setSheetState] = useState<CourseSheetProps>({
    title: "Thêm khóa học",
    formDefaultValues: FORM_DEFAULT_VALUES,
    onSubmit: () => {},
  });
  const { openDialog, closeDialog } = useDialogStore();

  const { data: courses } = courseApi.getCoursesByStudyPlan;

  const createCourseMutation = courseApi.createCourse;
  const deleteCourseMutation = courseApi.deleteCourse;

  const handleCreateCourse = async (courseData: CourseFormValues) => {
    try {
      const payload = courseApiMapper.toRequestCourseDto(
        courseData,
        Number(studyPlanId),
      );

      await createCourseMutation.mutateAsync({ body: payload });
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      const course = courses?.find((c) => c.id === courseId);
      if (!course) {
        alert("Không tìm thấy khóa học");
        return;
      }
      openDialog({
        title: "Xác nhận xóa",
        view: (
          <ConfirmDelete
            message={`Bạn có chắc chắn muốn xóa khóa học "${course.name}" không? Hành động này không thể hoàn tác.`}
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
      title: "Thêm khóa học",
      onSubmit: handleCreateCourse,
      formDefaultValues: FORM_DEFAULT_VALUES,
    });
    setIsSheetOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Danh sách khóa học</h2>
        <Button variant="outline" onClick={() => openCreateCourseSheet()}>
          Thêm khóa học
        </Button>
      </div>
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => {
                openDialog("COURSE_FORM",{
                  courseId: Number(course.id),
                  studyPlanId: Number(studyPlanId),
                  defaultValues: courseFormMapper.toFormValues(course),
                })
              }}
              onDelete={() => {
                openDialog("CONFIRM_DELETE",{
                  itemType: "khóa học",
                  itemName: String(course.name),
                  onConfirm: () => deleteCourseMutation.mutate({
                    path:{
                      courseId: Number(course.id)
                    }
                  })
                })
              }}
              onView={() =>
                navigate(
                  `/app/courses/${course.id}`,
                )
              }
            />
          ))}
        </div>
      ) : (
        <div>
          Chưa có khóa học nào trong kế hoạch học tập này. Hãy thêm lớp học
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
