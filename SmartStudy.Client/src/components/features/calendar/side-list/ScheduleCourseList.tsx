import {
  getCoursesBySemester,
  type SimpleResponseCourseDto,
} from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import CourseList from "../../course/CourseList";

interface ScheduleCourseListProps {
  semesterId: number | string | undefined;
  selectedCourseId?: string | number;
  onSelectCourse?: (course: SimpleResponseCourseDto) => void; // Callback khi chọn course để đăng ký lịch
}

export default function ScheduleCourseList({
  semesterId,
  selectedCourseId,
  onSelectCourse,
}: ScheduleCourseListProps) {
  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses", semesterId],
    queryFn: async () => {
      if (!semesterId) return [];
      const response = await getCoursesBySemester({
        path: { semesterId: semesterId },
      });
      return response.data;
    },
    enabled: !!semesterId,
  });

  return (
    <div className="h-full overflow-y-auto">
      {isLoading && <p>Loading courses...</p>}
      {error && <p>Error loading courses: {error.message}</p>}
      {courses && (
        <CourseList
          selectedCourseId={selectedCourseId}
          courses={courses}
          listStyle="vertical"
          onSelectCourse={(courseId) => {
            const selected = courses.find((c) => c.id === courseId);
            if (selected && onSelectCourse) {
              onSelectCourse(selected);
            }
          }}
        />
      )}
    </div>
  );
}
