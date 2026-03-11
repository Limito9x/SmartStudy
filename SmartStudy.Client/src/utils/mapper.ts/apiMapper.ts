import type { CourseFormValues } from "@/components/forms/course/schema";
import type { RequestCourseDto } from "@/services/api/types.gen";

export const courseApiMapper = {
  toRequestCourseDto: (
    courseData: CourseFormValues,
    studyPlanId: number,
  ): RequestCourseDto => ({
    studyPlanId,
    subjectId: courseData.subjectId,
    mentor: courseData.mentor,
    alternativeName: courseData.alternativeName,
    targetScore: null,
    finalScore: null,
  }),
};
