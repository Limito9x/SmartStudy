import CourseList from "@/components/features/course/CourseList";
import { CourseForm } from "@/components/forms/course";
import { useDialogStore } from "@/stores/useDialogStore";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import type { SemesterOutletContext } from "@/layouts/StudyPlanLayout";
import { useCourse } from "@/hooks/entities/useCourse";

export default function SemesterPage() {
  const { semesterId } = useParams<{ semesterId: string }>();
  const { currentStudyPlan } = useOutletContext<SemesterOutletContext>();
  const navigate = useNavigate();

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useCourse({
    studyPlanId: Number(semesterId),
  }).getCoursesByStudyPlan;

  const { openDialog, closeDialog } = useDialogStore();

  const handleAddCourse = () => {
    if (!semesterId) return;
    openDialog({
      title: `Thêm lớp học phần cho học kỳ ${currentStudyPlan ? `HK${currentStudyPlan.academicTermId} ${currentStudyPlan.academicYearId}` : ""}`,
      view: (
        <CourseForm semesterId={Number(semesterId)} onSuccess={closeDialog} />
      ),
    });
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {currentStudyPlan && (
        <h1 className="text-2xl font-bold">{currentStudyPlan.displayName}</h1>
      )}
      {coursesLoading && <p>Loading courses...</p>}
      {coursesError && <p>Error loading courses: {coursesError.message}</p>}
      {courses && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold mb-2">
              Danh sách lớp học phần:
            </h2>
            <div className="flex gap-2">
              <Button onClick={handleAddCourse}>Thêm lớp học phần</Button>
              <Button
                onClick={() =>
                  navigate(`/app/study-plans/${semesterId}/schedule`)
                }
              >
                Sắp xếp TKB
              </Button>
            </div>
          </div>
          <CourseList
            courses={courses}
            onSelectCourse={(courseId) =>
              navigate(`/app/study-plans/${semesterId}/courses/${courseId}`)
            }
          />
        </div>
      )}
    </div>
  );
}
