import type { ScheduleResponseDto } from "@/services/api";
import type { CalendarEvent } from "@/components/features/calendar/WeekCalendar";

export function mapCourseSchedulesToCalendarEvents({
  schedules,
}: {
  schedules: ScheduleResponseDto[];
}): CalendarEvent[] {
  const durationUnitToMinutes = (duration: number, unit: string) => {
    switch (unit) {
      case "Minutes":
        return duration;
      case "Hours":
        return duration * 60;
      case "Periods":
        return duration * 45;
      default:
        return duration; // Mặc định là phút nếu không xác định được đơn vị
    }
  };
  const events: CalendarEvent[] = schedules.map((schedule) => {
    return {
      id: String(schedule.id),
      title: schedule.course?.name || "Lịch học",
      startHour: schedule.startHour,
      startMinute: schedule.startMinute,
      dayOfWeek: schedule.dayOfWeek,
      durationMinutes: durationUnitToMinutes(
        Number(schedule.duration),
        schedule.durationUnit,
      ),
      location: schedule.location,
      color: "bg-blue-500/80", // Màu mặc định, có thể tùy chỉnh theo môn học hoặc loại lịch
    } as CalendarEvent;
  });
  return events;
}
