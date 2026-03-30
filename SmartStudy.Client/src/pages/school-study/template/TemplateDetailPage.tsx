import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
      <div className="rounded-xl border bg-slate-50 p-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{data.name}</h1>
            <p className="text-lg text-slate-600">
              {data.description || "Không có mô tả"}
            </p>
            <p className="text-sm font-medium text-slate-700">
              {data.createdByName
                ? `Tạo bởi ${data.createdByName}`
                : "Tác giả chưa cập nhật"}
            </p>
          </div>

          <div className="w-full space-y-3 md:w-[320px]">
            {!isAdmin ? (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setIsCloneDialogOpen(true)}
              >
                Dùng template này
              </Button>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {data.isPublic ? "Public" : "Private"}
              </Badge>
              <Badge variant="secondary">{courseCount} môn học</Badge>
              <Badge variant="secondary">{routineCount} routines</Badge>
              <Badge variant="secondary">{durationDays} ngày</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {courses.length === 0 ? (
          <div className="rounded border bg-muted/40 p-4 text-sm text-muted-foreground">
            Template này chưa có dữ liệu môn học.
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            defaultValue={`course-0`}
            className="space-y-3"
          >
            {courses.map((course, courseIndex) => (
              <AccordionItem
                key={`${course.name || "course"}-${courseIndex}`}
                value={`course-${courseIndex}`}
                className="rounded-lg border bg-background px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="space-y-1 text-left">
                    <h3 className="text-base font-semibold">
                      {course.name || `Môn ${courseIndex + 1}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.goal || "Không có mục tiêu"}
                    </p>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-4 pt-2">
                  <div className="space-y-3">
                    {(course.routines ?? []).length === 0 ? (
                      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                        Môn học này chưa có routine.
                      </div>
                    ) : (
                      (course.routines ?? []).map((routine, routineIndex) => (
                        <div
                          key={`${routine.name || "routine"}-${routineIndex}`}
                          className="rounded-r-md border-l-4 border-primary bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-1">
                              <p className="font-semibold">
                                {routine.name || `Routine ${routineIndex + 1}`}
                              </p>
                              <p className="text-sm text-slate-600">
                                {routine.instructor
                                  ? `Giảng viên: ${routine.instructor}`
                                  : "Giảng viên: Chưa cập nhật"}
                              </p>
                              <p className="text-sm text-slate-600">
                                Ngày học: {routine.startDayOffset ?? 0} -{" "}
                                {routine.endDayOffset ?? "?"}
                              </p>
                            </div>

                            <Badge variant="outline" className="w-fit">
                              {routine.type || "N/A"}
                            </Badge>
                          </div>

                          <div className="mt-3 space-y-2">
                            {(routine.schedules ?? []).length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                Không có lịch cố định.
                              </p>
                            ) : (
                              (routine.schedules ?? []).map(
                                (schedule, scheduleIndex) => (
                                  <div
                                    key={`${routine.name || "routine"}-schedule-${scheduleIndex}`}
                                    className="flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-3 text-sm md:flex-row md:items-center md:justify-between"
                                  >
                                    <p className="font-medium text-slate-700">
                                      {dayOfWeekMap[
                                        Number(schedule.dayOfWeek)
                                      ] || "Không rõ thứ"}
                                    </p>
                                    <p className="text-slate-600">
                                      {schedule.startTime?.slice(0,5) || "--:--"} ·{" "}
                                      {schedule.duration ?? 0} phút
                                    </p>
                                    <p className="text-slate-600">
                                      {schedule.location || "Không có địa điểm"}
                                    </p>
                                  </div>
                                ),
                              )
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
