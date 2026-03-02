import { type SimpleResponseCourseDto } from "@/services/api";
import CourseCard from "./CourseCard";

export default function CourseList({
  courses,
}: {
  courses: SimpleResponseCourseDto[];
}) {
  return (
    <div>
      <h1>Danh sách lớp học phần:</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <CourseCard key={Number(course.id)} course={course} />
        ))}
      </div>
    </div>
  );
}
