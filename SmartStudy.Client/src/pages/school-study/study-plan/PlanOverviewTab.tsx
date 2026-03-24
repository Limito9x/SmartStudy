import { Button } from "@/components/ui/button";
import CourseCard from "@/components/features/course/CourseCard";
import { useCourse } from "@/hooks/entities/useCourse";
import type { CourseFormValues } from "@/components/forms/course/schema";
import { useNavigate, useParams } from "react-router-dom";
import { useDialogStore } from "@/stores/useDialogStore";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";

export default function PlanOverviewTab() {
  const { studyPlanId } = useParams();
  const navigate = useNavigate();
  const courseApi = useCourse({
    studyPlanId: Number(studyPlanId),
  });
  const { openDialog, closeDialog } = useDialogStore();

  const {getStudyPlanById} = useStudyPlan();
  const { data: studyPlanData } = getStudyPlanById(Number(studyPlanId));

  const { data: courses } = courseApi.getCourses;
  const deleteCourseMutation = courseApi.deleteCourse;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Danh sách khóa học</h2>
        <Button
          variant="outline"
          onClick={() =>
            openDialog("COURSE_FORM", {
              type: studyPlanData?.type || "Personal",
              studyPlanId: Number(studyPlanId),
            })
          }
        >
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
                openDialog("COURSE_FORM", {
                  type: studyPlanData?.type || "Personal",
                  courseId: Number(course.id),
                  studyPlanId: Number(studyPlanId),
                });
              }}
              onDelete={() => {
                openDialog("CONFIRM_DELETE", {
                  itemType: "khóa học",
                  itemName: String(course.name),
                  onConfirm: () => {
                    deleteCourseMutation.mutate({
                      path: {
                        courseId: Number(course.id),
                      },
                    });
                    closeDialog();
                  },
                });
              }}
              onView={() => navigate(`/app/study-plans/${studyPlanData?.id}/courses/${course.id}`)}
            />
          ))}
        </div>
      ) : (
        <div>
          Chưa có khóa học nào trong kế hoạch học tập này. Hãy thêm lớp học phần
          để bắt đầu lên kế hoạch học tập của bạn!
        </div>
      )}
    </div>
  );
}
