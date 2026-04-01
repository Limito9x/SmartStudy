import type {
  CourseStatus,
  EventType,
  ResponseTimelineEventDto,
  TaskType,
} from "@/services/api";

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  Enrolled: "Đang học",
  Completed: "Đã hoàn thành",
  Dropped: "Đã dừng",
};

export const COURSE_STATUS_BADGE_CLASS: Record<CourseStatus, string> = {
  Enrolled: "bg-blue-100 text-blue-800",
  Completed: "bg-emerald-100 text-emerald-800",
  Dropped: "bg-slate-200 text-slate-700",
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  Exam: "Kỳ thi",
  Assignment: "Bài tập",
  Presentation: "Thuyết trình",
  ProjectDeadline: "Hạn dự án",
  Other: "Khác",
};

export const ROUTINE_TASK_TYPE_LABELS: Record<TaskType, string> = {
  ClassSession: "Buổi học",
  SelfStudy: "Tự học",
  AssignmentWork: "Làm bài tập",
  Meeting: "Họp",
};

export function toNumber(value: unknown): number {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function stringifyNullable(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}

export function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

export function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function getDaysLeft(value?: string | null): number | null {
  const dueDate = parseDate(value);
  if (!dueDate) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffMs = dueDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDayMonth(value?: string | null): {
  day: string;
  month: string;
} {
  const date = parseDate(value);
  if (!date) {
    return { day: "--", month: "--" };
  }

  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: String(date.getMonth() + 1).padStart(2, "0"),
  };
}

export function getCountdownClassName(daysLeft: number | null): string {
  if (daysLeft === null) {
    return "rounded-full border px-2 py-0.5 text-xs font-medium text-slate-600";
  }

  if (daysLeft < 5) {
    return "rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700";
  }

  if (daysLeft < 10) {
    return "rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700";
  }

  return "rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700";
}

export function getCountdownText(daysLeft: number | null): string {
  if (daysLeft === null) {
    return "Chưa có hạn";
  }
  if (daysLeft < 0) {
    return `Quá hạn ${Math.abs(daysLeft)} ngày`;
  }
  if (daysLeft === 0) {
    return "Hôm nay";
  }
  return `${daysLeft} ngày`;
}

export function normalizeHexColor(color?: string | null): string | null {
  if (!color) {
    return null;
  }

  const normalized = color.trim();
  if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(normalized)) {
    if (normalized.length === 4) {
      const r = normalized[1];
      const g = normalized[2];
      const b = normalized[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return normalized;
  }

  return null;
}

export function hexToRgba(hex: string, alpha: number): string {
  const parsed = normalizeHexColor(hex);
  if (!parsed) {
    return `rgba(59,130,246,${alpha})`;
  }

  const raw = parsed.replace("#", "");
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}

export function sortTimelineEventsByPriority(
  events: ResponseTimelineEventDto[],
): ResponseTimelineEventDto[] {
  return [...events].sort((a, b) => {
    const priorityA = toNumber(a.priority);
    const priorityB = toNumber(b.priority);

    if (priorityB !== priorityA) {
      return priorityB - priorityA;
    }

    const dueA = parseDate(a.dueDate);
    const dueB = parseDate(b.dueDate);

    if (dueA && dueB) {
      return dueA.getTime() - dueB.getTime();
    }
    if (dueA) {
      return -1;
    }
    if (dueB) {
      return 1;
    }
    return 0;
  });
}

export function getEventTypeLabel(type?: EventType | null): string {
  if (!type) {
    return EVENT_TYPE_LABELS.Other;
  }
  return EVENT_TYPE_LABELS[type] ?? EVENT_TYPE_LABELS.Other;
}

export function getRoutineTaskTypeLabel(type?: TaskType | null): string {
  if (!type) {
    return "Lịch học";
  }
  return ROUTINE_TASK_TYPE_LABELS[type] ?? String(type);
}
