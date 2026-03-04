// ── Constants ──────────────────────────────────────────────
const START_HOUR = 7;
const END_HOUR = 22;
const ROW_HEIGHT = 64; // px per hour
const TIME_COL_WIDTH = 56; // px

const hours = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);

// ── Types ───────────────────────────────────────────────────
export interface WeekDayDef {
  name: string;
  short: string;
  value: number; // 0 = Mon … 6 = Sun
}

export interface CalendarEvent {
  id: string | number;
  title: string;
  dayOfWeek: number; // 0..6
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  color?: string; // tailwind bg class e.g. "bg-blue-500"
  location?: string;
}

interface WeekCalendarProps {
  events?: CalendarEvent[];
  onCellClick?: (dayOfWeek: WeekDayDef, hour: number) => void;
}

// ── Static data ─────────────────────────────────────────────
const weekDays: WeekDayDef[] = [
  { name: "Thứ 2", short: "T2", value: 0 },
  { name: "Thứ 3", short: "T3", value: 1 },
  { name: "Thứ 4", short: "T4", value: 2 },
  { name: "Thứ 5", short: "T5", value: 3 },
  { name: "Thứ 6", short: "T6", value: 4 },
  { name: "Thứ 7", short: "T7", value: 5 },
  { name: "CN", short: "CN", value: 6 },
];

// ── Component ────────────────────────────────────────────────
export default function WeekCalendar({
  events = [],
  onCellClick,
}: WeekCalendarProps) {
  const totalHeight = (END_HOUR - START_HOUR) * ROW_HEIGHT;

  return (
    <div className="border border-border rounded-lg flex flex-col h-full overflow-hidden">
      {/* ── Sticky header ── */}
      <div className="flex shrink-0 border-b border-border bg-muted">
        {/* Time gutter placeholder */}
        <div style={{ width: TIME_COL_WIDTH }} className="shrink-0" />

        {/* Day name columns */}
        {weekDays.map((day) => (
          <div
            key={day.value}
            className="flex-1 border-l border-border py-2 text-center text-xs font-semibold sm:text-sm"
          >
            <span className="hidden sm:inline">{day.name}</span>
            <span className="sm:hidden">{day.short}</span>
          </div>
        ))}
      </div>

      {/* ── Scrollable body ── */}
      <div className="overflow-y-auto flex-1 min-h-0">
        <div className="flex" style={{ height: totalHeight }}>
          {/* Time axis */}
          <div
            style={{ width: TIME_COL_WIDTH }}
            className="shrink-0 relative select-none"
          >
            {hours.map((hour) => (
              <div
                key={hour}
                style={{
                  top: (hour - START_HOUR) * ROW_HEIGHT,
                  height: ROW_HEIGHT,
                }}
                className="absolute w-full border-b border-border"
              >
                <span className="absolute top-0 right-1.5 -translate-y-1/2 text-[10px] leading-none text-muted-foreground tabular-nums bg-background px-0.5">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => (
            <div
              key={day.value}
              className="flex-1 relative border-l border-border"
            >
              {/* Hour grid lines + click targets */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    top: (hour - START_HOUR) * ROW_HEIGHT,
                    height: ROW_HEIGHT,
                  }}
                  className="absolute w-full border-b border-border hover:bg-accent/20 active:bg-accent/40 cursor-pointer transition-colors"
                  onClick={() => onCellClick?.(day, hour)}
                />
              ))}

              {/* Event blocks */}
              {events
                .filter((e) => e.dayOfWeek === day.value)
                .map((event) => {
                  const top =
                    (event.startHour - START_HOUR) * ROW_HEIGHT +
                    (event.startMinute / 60) * ROW_HEIGHT;
                  const height = (event.durationMinutes / 60) * ROW_HEIGHT;
                  return (
                    <div
                      key={event.id}
                      style={{ top, height, left: 2, right: 2 }}
                      className={`absolute z-10 rounded-md px-1.5 py-1 text-xs text-white overflow-hidden shadow-sm ${event.color ?? "bg-primary"}`}
                    >
                      <p className="font-semibold leading-tight truncate">
                        {event.title}
                      </p>
                      {event.location && (
                        <p className="truncate opacity-80 mt-0.5">
                          {event.location}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
