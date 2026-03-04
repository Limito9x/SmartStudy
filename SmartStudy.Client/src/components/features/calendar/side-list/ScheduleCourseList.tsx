import { getCoursesBySemester } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import CourseList from "../../school-study/course/CourseList";

interface ScheduleCourseListProps {
  semesterId: number | string | undefined;
}

export default function ScheduleCourseList({
  semesterId,
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
        path: { SemesterId: semesterId },
      });
      return response.data;
    },
    enabled: !!semesterId,
  });

  return (
    <div className="h-full overflow-y-auto">
      {isLoading && <p>Loading courses...</p>}
      {error && <p>Error loading courses: {error.message}</p>}
      {courses && <CourseList courses={courses} listStyle="vertical" />}
    </div>
  );
}
