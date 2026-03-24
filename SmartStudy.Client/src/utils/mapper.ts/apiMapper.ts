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
  StudyPlanType,
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
    startDate: studyPlanData.startDate,
    endDate: studyPlanData.endDate,
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
    timelineEventId: null,
    startDate: routineData.startDate || null,
    endDate: routineData.endDate || null,
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
    studyPlanId?: number,
  ): RequestTaskDto => ({
    studyPlanId: studyPlanId || null,
    name: taskData.name,
    description: taskData.description || null,
    taskDate: parseDateToYyyyMmDd(taskData.taskDate),
    startTime: parseTimeToHHmmss(taskData.startTime),
    plannedDuration: taskData.plannedDuration || 60,
    type: taskData.type,
    courseId: typeof taskData.courseId === "number" ? taskData.courseId : null,
  }),
};

export const timelineEventApiMapper = {
  toRequestTimelineEventDto: (
    eventData: TimelineEventFormValues,
  ): RequestTimelineEventDto => ({
    courseId: eventData.courseId,
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
    assetIds: logData.assetIds || null,
    markAsCompleted: logData.markAsCompleted,
  }),
};

export const subjectApiMapper = {
  toRequestSubjectDto: (
    subjectData: SubjectFormValues,
  ): RequestSubjectDto => ({
    name: subjectData.name,
    code: subjectData.code || null,
    credits: subjectData.credits || null,
    type: subjectData.type || "Academic",
  }),
};