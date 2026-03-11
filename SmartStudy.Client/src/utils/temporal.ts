export function toScheduleXEvent(event: {
  id: string;
  title: string;
  startDate: string; // "2026-03-11"
  startTime: string; // "08:00"
  endTime: string; // "09:30"
  location?: string;
}) {
  console.log("Converting event to ScheduleXEvent:", event);
  const [startHour, startMinute] = event.startTime.split(":").map(Number);
  const [endHour, endMinute] = event.endTime.split(":").map(Number);
  const [year, month, day] = event.startDate.split("-").map(Number);

  return {
    id: event.id,
    title: event.title,
    location: event.location,
    start: Temporal.ZonedDateTime.from({
      year,
      month,
      day,
      hour: startHour,
      minute: startMinute,
      second: 0,
      timeZone: "Asia/Ho_Chi_Minh",
    }),
    end: Temporal.ZonedDateTime.from({
      year,
      month,
      day,
      hour: endHour,
      minute: endMinute,
      second: 0,
      timeZone: "Asia/Ho_Chi_Minh",
    }),
  };
}

export function toDateString(dt: Temporal.ZonedDateTime): string {
  return `${dt.year}-${String(dt.month).padStart(2, "0")}-${String(dt.day).padStart(2, "0")}`;
}
