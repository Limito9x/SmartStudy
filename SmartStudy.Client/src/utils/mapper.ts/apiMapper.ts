import type { CourseFormValues } from "@/components/forms/course/schema";
import type {
  RequestCourseDto,
  RequestTaskDto,
  RequestRoutineDto,
  RequestTimelineEventDto,
} from "@/services/api/types.gen";
import type { RoutineFormValues } from "@/components/forms/routine/schema";
import type { TaskFormValues } from "@/components/forms/task/schema";
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
    instructor: routineData.instructor || null,
    description: routineData.description || null,
    type: routineData.type,
    courseId:
      typeof routineData.courseId === "number" ? routineData.courseId : null,
    startDate: routineData.startDate
      ? new Date(routineData.startDate).toISOString()
      : new Date().toISOString(),
    endDate: routineData.endDate
      ? new Date(routineData.endDate).toISOString()
      : null,
    timelineEventId: null,
    schedules: routineData.schedules?.map((s) => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      duration: s.duration,
      location: s.location || null,
    })) || null,
  }),
};

const parseTimeToHHmmss = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  if (value.includes("T")) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}:00`;
  }

  const parts = value.split(":");
  if (parts.length < 2) {
    return null;
  }

  const hh = parts[0].padStart(2, "0");
  const mm = parts[1].padStart(2, "0");
  const ss = (parts[2] ?? "00").padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const parseDateToYyyyMmDd = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateDurationMinutes = (
  startAt?: string | null,
  endAt?: string | null,
): number | null => {
  const start = parseTimeToHHmmss(startAt);
  const end = parseTimeToHHmmss(endAt);

  if (!start || !end) {
    return null;
  }

  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  const startTotal = sH * 60 + sM;
  const endTotal = eH * 60 + eM;
  const duration = endTotal - startTotal;

  return duration > 0 ? duration : null;
};

export const taskApiMapper = {
  toRequestTaskDto: (
    taskData: TaskFormValues,
    studyPlanId: number,
  ): RequestTaskDto => ({
    studyPlanId,
    name: taskData.name,
    description: taskData.description || null,
    taskDate: parseDateToYyyyMmDd(taskData.dueDate),
    startTime: parseTimeToHHmmss(taskData.startAt),
    plannedDuration: calculateDurationMinutes(taskData.startAt, taskData.endAt),
    type: taskData.type,
    courseId: typeof taskData.courseId === "number" ? taskData.courseId : null,
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
