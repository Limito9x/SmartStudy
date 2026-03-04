import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { type SimpleResponseCourseDto } from "@/services/api";

interface CourseCardProps {
  course: SimpleResponseCourseDto;
  onClick?: (courseId: string | number) => void;
  isSelected?: boolean;
}

export default function CourseCard({ course, onClick, isSelected }: CourseCardProps) {
  return (
    <Card className={`card-interactive ${isSelected ? "selected" : ""}`} onClick={() => onClick?.(course.id)}>
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Số tín chỉ: {String(course.credits)}</p>
      </CardContent>
    </Card>
  );
}
