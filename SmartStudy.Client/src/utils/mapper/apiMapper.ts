import type { CourseFormValues } from "@/components/forms/course/schema";
import type {
  RequestCourseDto,
  RequestTaskDto,
  RequestRoutineDto,
  RequestTimelineEventDto,
  RequestScheduleDto,
  LogWorkDto,
  RequestStudyPlanDto,
  RequestSubjectDto,
} from "@/services/api/types.gen";
import type { RoutineFormValues } from "@/components/forms/routine/schema";
import type { TaskFormValues } from "@/components/forms/task/schema";
import type { TimelineEventFormValues } from "@/components/forms/timeline-event/schema";
import type { ScheduleFormValues } from "@/components/forms/schedule/schema";
import type { LogFormValues } from "@/components/forms/log/schema";
import type { StudyPlanFormValues } from "@/components/forms/study-plan/schema";
import type { SubjectFormValues } from "@/components/forms/subject/schema";

export const studyPlanApiMapper = {
  toRequeststudyPlanDto: (
    studyPlanData: StudyPlanFormValues,
  ): RequestStudyPlanDto => ({
    name: studyPlanData.name,
    startDate: studyPlanData.startDate.toISOString(),
    endDate: studyPlanData.endDate.toISOString(),
    termId: studyPlanData.termId || null,
    yearId: studyPlanData.yearId || null,
    type: studyPlanData.type,
  }),
};

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
    color: courseData.color || null,
    subjectId: courseData.subjectId || null,
  }),
};

export const routineApiMapper = {
  toRequestRoutineDto: (
    routineData: RoutineFormValues,
    studyPlanId?: number,
  ): RequestRoutineDto => ({
    studyPlanId: studyPlanId || null,
    name: routineData.name,
    instructor: routineData.instructor || null,
    description: routineData.description || null,
    type: routineData.type,
    courseId:
      typeof routineData.courseId === "number" ? routineData.courseId : null,
    timelineEventId: routineData.eventId || null,
    startDate: routineData.startDate?.toISOString() || null,
    endDate: routineData.endDate?.toISOString() || null,
    schedules:
      routineData.schedules?.map((s) => ({
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

export const taskApiMapper = {
  toRequestTaskDto: (
    taskData: TaskFormValues,
    studyPlanId?: number,
  ): RequestTaskDto => ({
    studyPlanId: studyPlanId || null,
    name: taskData.name,
    description: taskData.description || null,
    startDateTime: taskData.startDateTime?.toISOString() || null,
    endDateTime: taskData.endDateTime?.toISOString() || null,
    type: taskData.type,
    courseId: typeof taskData.courseId === "number" ? taskData.courseId : null,
    timelineEventId: taskData.eventId || null,
  }),
};

export const timelineEventApiMapper = {
  toRequestTimelineEventDto: (
    eventData: TimelineEventFormValues,
  ): RequestTimelineEventDto => ({
    courseId: eventData.courseId,
    title: eventData.title,
    notes: eventData.notes || "",
    startDateTime: eventData.startDateTime.toISOString(),
    endDateTime: eventData.endDateTime.toISOString(),
    isAllDay: eventData.isAllDay,
    type: eventData.type,
    priority: eventData.priority,
    location: eventData?.location || "",
  }),
};

export const scheduleApiMapper = {
  toRequestScheduleDto: (
    scheduleData: ScheduleFormValues,
    routineId: number,
  ): RequestScheduleDto => ({
    routineId,
    dayOfWeek: scheduleData.dayOfWeek,
    startTime: parseTimeToHHmmss(scheduleData.startTime) || "07:00:00",
    duration: scheduleData.duration,
    location: scheduleData.location || null,
  }),
};

export const logApiMapper = {
  toLogWorkDto: (logData: LogFormValues): LogWorkDto => ({
    note: logData.note || null,
    actualDuration: logData.actualDuration || 0,
    timerStartAt: parseTimeToHHmmss(logData.timerStartAt) || null,
    timerEndAt: parseTimeToHHmmss(logData.timerEndAt) || null,
    difficultyLevel: logData.difficultyLevel || null,
    comprehensionLevel: logData.comprehensionLevel || null,
    markAsCompleted: logData.markAsCompleted,
  }),
};

export const subjectApiMapper = {
  toRequestSubjectDto: (subjectData: SubjectFormValues): RequestSubjectDto => ({
    name: subjectData.name,
    code: subjectData.code || null,
    credits: subjectData.credits || null,
    type: subjectData.type || "Academic",
  }),
};
