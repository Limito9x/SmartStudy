import { type SimpleResponseCourseDto } from "@/services/api";

import CourseCard from "./CourseCard";
import { useNavigate } from "react-router-dom";

export default function CourseList({
  courses,
  semesterId,
}: {
  courses: SimpleResponseCourseDto[];
  semesterId?: string;
}) {
  const navigate = useNavigate();
  const handleCourseClick = (courseId: string | number) => {
    navigate(`/app/semesters/${semesterId}/courses/${courseId}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <CourseCard
            key={Number(course.id)}
            course={course}
            onClick={handleCourseClick}
          />
        ))}
      </div>
    </div>
  );
}
