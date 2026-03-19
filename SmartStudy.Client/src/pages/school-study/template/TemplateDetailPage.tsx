import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useGetPlanTemplateById } from "@/hooks/entities/usePlanTemplate.ts";
import CloneTemplateDialog from "@/components/features/plan/CloneTemplateDialog";
import { useAuthStore } from "@/stores/useAuthStore";

const dayOfWeekMap: Record<number, string> = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};

const extractStudyPlanId = (data: unknown): number | null => {
  if (!data || typeof data !== "object") {
    return null;
  }

  const maybeData = data as Record<string, unknown>;
  const idCandidate =
    maybeData.studyPlanId ?? maybeData.id ?? maybeData.createdStudyPlanId;

  if (typeof idCandidate === "number") {
    return idCandidate;
  }

  if (typeof idCandidate === "string" && idCandidate.trim() !== "") {
    const parsed = Number(idCandidate);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

export default function TemplateDetailPage() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const parsedTemplateId = Number(templateId);
  const { data, isLoading, error } = useGetPlanTemplateById(parsedTemplateId);

  const courseCount = data?.courseCount ?? 0;
  const routineCount = data?.routineCount ?? 0;
  const durationDays = data?.durationDays ?? 0;

  const courses = useMemo(() => data?.payload?.courses ?? [], [data]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          Không thể tải chi tiết template.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{data.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.description || "Không có mô tả"}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.createdByName && `Tạo bởi ${data.createdByName}`}&nbsp;
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={data.isPublic ? "default" : "secondary"}>
                {data.isPublic ? "Public" : "Private"}
              </Badge>
              <Badge variant="outline">{courseCount} môn</Badge>
              <Badge variant="outline">{routineCount} routine</Badge>
              <Badge variant="outline">{durationDays} ngày</Badge>
            </div>
          </div>

          {!isAdmin ? (
            <div>
              <Button onClick={() => setIsCloneDialogOpen(true)}>
                Dùng template này
              </Button>
            </div>
          ) : null}
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {courses.length === 0 ? (
          <div className="rounded border bg-muted/40 p-4 text-sm text-muted-foreground">
            Template này chưa có dữ liệu môn học.
          </div>
        ) : (
          courses.map((course, courseIndex) => (
            <Collapsible
              key={`${course.name || "course"}-${courseIndex}`}
              defaultOpen
            >
              <Card>
                <CardHeader>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
                    <div className="space-y-1">
                      <h3 className="font-semibold">
                        {course.name || `Môn ${courseIndex + 1}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.goal || "Không có mục tiêu"}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="space-y-3">
                    {(course.routines ?? []).map((routine, routineIndex) => (
                      <div
                        key={`${routine.name || "routine"}-${routineIndex}`}
                        className="rounded border p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">
                            {routine.name || `Routine ${routineIndex + 1}`}
                          </p>
                          <Badge variant="outline">
                            {routine.type || "N/A"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {routine.instructor && `Giảng viên: ${routine.instructor}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Từ ngày {routine.startDayOffset ?? 0} đến{" "}
                          {routine.endDayOffset ?? "?"}
                        </p>
                        <div className="mt-2 space-y-1 text-sm">
                          {(routine.schedules ?? []).length === 0 ? (
                            <p className="text-muted-foreground">
                              Không có lịch cố định.
                            </p>
                          ) : (
                            (routine.schedules ?? []).map(
                              (schedule, scheduleIndex) => (
                                <p
                                  key={`${routine.name || "routine"}-schedule-${scheduleIndex}`}
                                >
                                  {dayOfWeekMap[Number(schedule.dayOfWeek)] ||
                                    "Không rõ thứ"}{" "}
                                  - {schedule.startTime || "--:--"} (
                                  {schedule.duration ?? 0} phút)
                                  {schedule.location
                                    ? ` - ${schedule.location}`
                                    : ""}
                                </p>
                              ),
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {!isAdmin ? (
        <CloneTemplateDialog
          open={isCloneDialogOpen}
          onOpenChange={setIsCloneDialogOpen}
          templateId={parsedTemplateId}
          defaultName={data.name || undefined}
          onCloneSuccess={(response) => {
            const createdStudyPlanId = extractStudyPlanId(response);
            if (createdStudyPlanId) {
              navigate(`/app/study-plans/${createdStudyPlanId}`);
              return;
            }

            navigate("/app");
          }}
        />
      ) : null}
    </div>
  );
}
