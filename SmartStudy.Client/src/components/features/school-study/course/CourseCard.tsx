import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { type SimpleResponseCourseDto } from "@/services/api"

interface CourseCardProps {
    course: SimpleResponseCourseDto
}

export default function CourseCard({ course }: CourseCardProps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{course.name}</CardTitle>
          <CardDescription>
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Số tín chỉ: {String(course.credits)}</p>
        </CardContent>
      </Card>
    );
}