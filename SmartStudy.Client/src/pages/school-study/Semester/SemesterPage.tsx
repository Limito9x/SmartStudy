import { getCoursesBySemester } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import CourseList from "@/components/features/school-study/course/CourseList";
import { CourseForm } from "@/components/forms/course";
import { useDialogStore } from "@/stores/useDialogStore";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import type { SemesterOutletContext } from "@/layouts/SchoolStudyLayout";

export default function SemesterPage() {
  const { semesterId } = useParams<{ semesterId: string }>();
  const { currentSemester } = useOutletContext<SemesterOutletContext>();

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["courses", semesterId],
    queryFn: async () => {
      if (!semesterId) return [];
      const response = await getCoursesBySemester({
        path: { SemesterId: semesterId },
      });
      return response.data;
    },
    enabled: !!semesterId,
  });

  const { openDialog, closeDialog } = useDialogStore();

  const handleAddCourse = () => {
    if (!semesterId) return;
    openDialog({
      title: `Thêm lớp học phần cho học kỳ ${currentSemester ? `HK${currentSemester.term} ${currentSemester.year}` : ""}`,
      view: (
        <CourseForm semesterId={Number(semesterId)} onSuccess={closeDialog} />
      ),
    });
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {currentSemester && (
        <h1 className="text-2xl font-bold">{currentSemester.name}</h1>
      )}
      {coursesLoading && <p>Loading courses...</p>}
      {coursesError && <p>Error loading courses: {coursesError.message}</p>}
      {courses && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold mb-2">
              Danh sách lớp học phần:
            </h2>
            <Button onClick={handleAddCourse}>Thêm lớp học phần</Button>
          </div>
          <CourseList courses={courses} semesterId={semesterId} />
        </div>
      )}
    </div>
  );
}
