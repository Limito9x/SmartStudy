import { type ResponseCourseDto } from "@/services/api";

export default function CourseOverview({ course }: { course: ResponseCourseDto | null | undefined }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tổng quan về môn học</h2>
        <p><strong>Tên môn học:</strong> {course?.name}</p>
        <p><strong>Số tín chỉ:</strong> {course?.credits}</p>
        <p><strong>Mục tiêu:</strong> {course?.targetGrade}</p>
        <p><strong>Điểm hiện tại:</strong> {course?.currentGPA}</p>
    </div>
  );
}