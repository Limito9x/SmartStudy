import type { CourseFormValues } from "@/components/forms/course/schema";
import type {
  RequestCourseDto,
  RequestRoutineDto,
  RequestTimelineEventDto,
} from "@/services/api/types.gen";
import type { RoutineFormValues } from "@/components/forms/routine/schema";
import type { TimelineEventFormValues } from "@/components/forms/timeline-event/schema";

export const courseApiMapper = {
  toRequestCourseDto: (
    courseData: CourseFormValues,
    studyPlanId: number,
  ): RequestCourseDto => ({
    studyPlanId,
    name: courseData.name,
    targetScore: null,
    finalScore: null,
    goal: courseData.goal || null,
  }),
};

export const routineApiMapper = {
  toRequestRoutineDto: (
    routineData: RoutineFormValues,
    studyPlanId: number,
  ): RequestRoutineDto => ({
    studyPlanId,
    name: routineData.name,
    instructor: routineData.instructor || "",
    description: routineData.description || "",
    type: routineData.type,
    courseId: Number(routineData.courseId),
    startDate: new Date(routineData?.startDate || "").toISOString(),
    endDate: new Date(routineData?.endDate || "").toISOString() || null,
    timelineEventId: null,
  }),
};

export const timelineEventApiMapper = {
  toRequestTimelineEventDto: (
    eventData: TimelineEventFormValues,
    courseId: number,
  ): RequestTimelineEventDto => ({
    courseId,
    title: eventData.title,
    notes: eventData.notes || "",
    dueDate: eventData?.dueDate
      ? new Date(eventData?.dueDate).toISOString()
      : null,
    type: eventData.type,
    priority: eventData.priority,
    location: eventData?.location || "",
  }),
};
