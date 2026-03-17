import type { CourseFormValues } from "@/components/forms/course/schema";
import type { TaskFormValues } from "@/components/forms/task/schema";
import type { RoutineFormValues } from "@/components/forms/routine/schema";
import type {
  ResponseCourseDto,
  ResponseTimelineEventDto,
  ResponseTaskDto,
  ResponseRoutineDto,
} from "@/services/api/types.gen";

const formatDueDate = (dueDate: string | null | undefined) => {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  if (date.getFullYear() <= 1) return null;
  return date.toISOString();
};

export const courseFormMapper = {
  toFormValues: (courseDto: ResponseCourseDto): CourseFormValues => ({
    name: courseDto.name || "",
    goal: courseDto.goal || "",
    targetScore: Number(courseDto.targetScore) || undefined,
    finalScore: Number(courseDto.finalScore) || undefined,
    color: courseDto.color || "#000000",
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

export const taskFormMapper = {
  toFormValues: (taskDto: ResponseTaskDto): TaskFormValues => ({
    name: taskDto.name,
    description: taskDto.description || "",
    type: taskDto.type,
    startTime: taskDto.startTime || "",
    plannedDuration: taskDto.plannedDuration
      ? Number(taskDto.plannedDuration)
      : undefined,
    taskDate: taskDto.taskDate || "",
    location: taskDto.location || "",
    courseId: Number(taskDto.courseId),
  }),
};

export const routineFormMapper = {
  toFormValues: (routineDto: ResponseRoutineDto): RoutineFormValues => ({
    name: routineDto.name,
    instructor: routineDto.instructor || "",
    description: routineDto.description || "",
    type: routineDto.type,
    courseId: Number(routineDto.courseId),
    schedules:
      routineDto.schedules?.map((s) => ({
        id: Number(s.id),
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        duration: Number(s.duration),
        location: s.location || "",
      })) || [],
  }),
};
