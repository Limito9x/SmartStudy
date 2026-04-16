import type { CourseFormValues } from "@/components/forms/course/schema";
import type { TaskFormValues } from "@/components/forms/task/schema";
import type { RoutineFormValues } from "@/components/forms/routine/schema";
import type { LogFormValues } from "@/components/forms/log/schema";
import type { StudyPlanFormValues } from "@/components/forms/study-plan/schema";
import type { SubjectFormValues } from "@/components/forms/subject/schema";
import type {
  ResponseCourseDto,
  ResponsePhaseDto,
  ResponseTaskDto,
  ResponseRoutineDto,
  ResponseSubjectDto,
  LogDto,
  TaskStatus,
  ResponseStudyPlanDto,
} from "@/services/api/types.gen";
import type { TimelineEventFormValues } from "@/components/forms/timeline-event/schema";

export const studyPlanFormMapper = {
  toFormValues: (studyPlanDto: ResponseStudyPlanDto): StudyPlanFormValues => ({
    name: studyPlanDto.name || "",
    startDate: studyPlanDto.startDate
      ? new Date(studyPlanDto.startDate)
      : new Date(),
    endDate: studyPlanDto.endDate ? new Date(studyPlanDto.endDate) : new Date(),
    termId: Number(studyPlanDto.termId) || null,
    yearId: Number(studyPlanDto.yearId) || null,
    type: studyPlanDto.type || "Academic",
  }),
};

export const courseFormMapper = {
  toFormValues: (courseDto: ResponseCourseDto): CourseFormValues => ({
    name: courseDto.name || "",
    goal: courseDto.goal || "",
    targetScore: Number(courseDto.targetScore) || undefined,
    finalScore: Number(courseDto.finalScore) || undefined,
    color: courseDto.color || "#000000",
    subjectId: Number(courseDto.subjectId) || null,
  }),
};

export const timelineEventFormMapper = {
  toFormValues: (eventDto: ResponsePhaseDto): TimelineEventFormValues => ({
    title: eventDto.title,
    type: eventDto.type,
    priority: eventDto.priority,
    startDateTime: new Date(eventDto.startDateTime),
    endDateTime: new Date(eventDto.endDateTime),
    isAllDay: eventDto.isAllDay || false,
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
    startDateTime: taskDto.startDateTime
      ? new Date(taskDto.startDateTime)
      : null,
    endDateTime: taskDto.endDateTime ? new Date(taskDto.endDateTime) : null,
    location: taskDto.location || "",
    courseId: null,
    eventId: Number(taskDto.phaseId) || null,
  }),
};

export const routineFormMapper = {
  toFormValues: (routineDto: ResponseRoutineDto): RoutineFormValues => ({
    name: routineDto.name,
    instructor: routineDto.instructor || "",
    description: routineDto.description || "",
    type: routineDto.type === "Milestone" ? "SelfStudy" : routineDto.type,
    startDate: new Date(routineDto.startDate) || null,
    endDate: routineDto.endDate ? new Date(routineDto.endDate) : null,
    courseId: undefined,
    eventId: Number(routineDto.phaseId) || undefined,
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

export const logFormMapper = {
  toFormValues: (logDto: LogDto, taskStatus: TaskStatus): LogFormValues => {
    let completed = false;
    if (taskStatus === "Completed") completed = true;

    return {
      markAsCompleted: completed,
      note: logDto.note || "",
      actualDuration: logDto.actualDuration
        ? Number(logDto.actualDuration)
        : undefined,
      comprehensionLevel: logDto.comprehensionLevel
        ? Number(logDto.comprehensionLevel)
        : undefined,
      difficultyLevel: logDto.difficultyLevel
        ? Number(logDto.difficultyLevel)
        : undefined,
      timerStartAt: logDto.timerStartAt || "",
      timerEndAt: logDto.timerEndAt || "",
      files: [],
    };
  },
};

export const subjectFormMapper = {
  toFormValues: (subjectDto: ResponseSubjectDto): SubjectFormValues => ({
    name: subjectDto.name,
    code: subjectDto.code || "",
    credits: Number(subjectDto.credits) || null,
    type: subjectDto.type || "Academic",
  }),
};
