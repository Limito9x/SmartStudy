import type { CourseFormValues } from "@/components/forms/course/schema";
import type { RequestCourseDto } from "@/services/api/types.gen";

export const courseFormMapper = {
   toFormValues: (courseDto: RequestCourseDto): CourseFormValues => ({
     subjectId: Number(courseDto.subjectId),
     mentor: courseDto.mentor || "",
     alternativeName: courseDto.alternativeName || "",
   }),
};