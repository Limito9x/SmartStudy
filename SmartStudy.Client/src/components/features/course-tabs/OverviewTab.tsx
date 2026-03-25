import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ResponseCourseDto,
  SimpleResponseRoutineDto,
} from "@/services/api";
import { weekdayMap } from "@/utils/calendar";
import { AlertCircle, Clock, MapPin, Target } from "lucide-react";

interface OverviewTabProps {
  course: ResponseCourseDto | null | undefined;
  routines: SimpleResponseRoutineDto[];
}

export default function OverviewTab({ course, routines }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin khóa học</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Tên khóa học
            </p>
            <p className="text-base font-semibold">{course?.name || "—"}</p>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Mục tiêu
            </p>
            <p className="text-sm">{course?.goal || "Không có mục tiêu"}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target size={16} className="text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Điểm mục tiêu
                </span>
              </div>
              <p className="text-2xl font-bold">{course?.targetScore ?? "—"}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target size={16} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Điểm hiện tại
                </span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">
                {course?.finalScore ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-md font-semibold">Lịch trình học tập</h2>
        {routines.length === 0 ? (
          <EmptyState text="Chưa có lịch trình" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        {routine.name}
                      </CardTitle>
                      {routine.instructor ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Giảng viên: {routine.instructor}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="secondary">{routine.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {routine.schedules?.length ? (
                    <div className="space-y-2">
                      {routine.schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Clock size={12} />
                          <span>
                            {weekdayMap[Number(schedule.dayOfWeek)] ||
                              `Thứ ${schedule.dayOfWeek}`}
                          </span>
                          <span>•</span>
                          <span>{schedule.startTime || "--:--"}</span>
                          {schedule.duration ? (
                            <>
                              <span>•</span>
                              <span>{schedule.duration} phút</span>
                            </>
                          ) : null}
                          {schedule.location ? (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={12} />
                                {schedule.location}
                              </span>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có lịch cố định.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
      <AlertCircle className="mb-2 h-8 w-8 opacity-40" />
      {text}
    </div>
  );
}
