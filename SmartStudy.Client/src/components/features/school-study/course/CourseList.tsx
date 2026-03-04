import { type SimpleResponseCourseDto } from "@/services/api";

import CourseCard from "./CourseCard";

interface CourseListProps {
  courses: SimpleResponseCourseDto[];
  listStyle?: "grid" | "vertical";
  selectedCourseId?: string | number;
  onCourseClick?: (courseId: string | number) => void;
}

export default function CourseList({
  courses,
  selectedCourseId,
  onCourseClick,
  listStyle = "grid",
}: CourseListProps) {
  const handleCourseClick = (courseId: string | number) => {
    if (onCourseClick) {
      onCourseClick(courseId);
    }
  };

  return (
    <div
      className={`${listStyle === "vertical" ? "list-vertical" : "list-grid"}`}
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
