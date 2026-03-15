import type { CourseFormValues } from "@/components/forms/course/schema";
import type {
  RequestCourseDto,
  ResponseTimelineEventDto,
} from "@/services/api/types.gen";

const formatDueDate = (dueDate: string | null | undefined) => {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  if (date.getFullYear() <= 1) return null;
  return date.toISOString();
};

export const courseFormMapper = {
  toFormValues: (courseDto: RequestCourseDto): CourseFormValues => ({
    name: courseDto.name,
    goal: courseDto.goal || "",
    targetScore: Number(courseDto.targetScore) || undefined,
    finalScore: Number(courseDto.finalScore) || undefined,
  }),
};

export const timelineEventFormMapper = {
  toFormValues: (eventDto: ResponseTimelineEventDto) => ({
    title: eventDto.title,
    type: eventDto.type,
    priority: eventDto.priority,
    dueDate: formatDueDate(eventDto.dueDate) || "",
    notes: eventDto.notes || "",
    location: eventDto.location || "",
    courseId: Number(eventDto.courseId),
  }),
};
