import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  asNumber,
  formatDayMonth,
} from "@/components/features/main/today-formatters";
import type { UpcomingEventDto } from "@/services/api";

interface TodayUpcomingEventsSectionProps {
  events: UpcomingEventDto[];
}

export default function TodayUpcomingEventsSection({
  events,
}: TodayUpcomingEventsSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sự kiện sắp tới</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {events.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Không có sự kiện sắp tới.
          </div>
        ) : (
          events.map((event, index) => {
            const { day, month } = formatDayMonth(event.dueDate);
            const daysUntil = Math.max(asNumber(event.daysUntil), 0);
            const urgent = daysUntil < 7;

            return (
              <div
                key={`${event.id ?? "event"}-${index}`}
                className="flex items-center gap-3 rounded-md border px-3 py-2.5"
              >
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md border bg-muted">
                  <span className="text-xs font-semibold leading-none">
                    {day}
                  </span>
                  <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">
                    /{month}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {event.title ?? "Sự kiện"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {event.courseName ?? "Không có môn học"}
                  </p>
                </div>

                <Badge variant={urgent ? "destructive" : "secondary"}>
                  {daysUntil === 0 ? "Hôm nay" : `${daysUntil} ngày`}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
