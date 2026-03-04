import { type SimpleResponseCourseDto } from "@/services/api";

import CourseCard from "./CourseCard";

interface CourseListProps {
  courses: SimpleResponseCourseDto[];
  listStyle?: "grid" | "vertical";
  selectedCourseId?: string | number;
  onSelectCourse?: (courseId: string | number) => void;
}

export default function CourseList({
  courses,
  selectedCourseId,
  onSelectCourse,
  listStyle = "grid",
}: CourseListProps) {
  const handleCourseClick = (courseId: string | number) => {
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
  };

  return (
    <div
      className={`${listStyle === "vertical" ? "list-vertical" : "list-grid"} p-2`}
    >
      {courses.map((course) => (
        <CourseCard
          key={Number(course.id)}
          course={course}
          onClick={handleCourseClick}
          isSelected={selectedCourseId === course.id}
        />
      ))}
    </div>
  );
}
