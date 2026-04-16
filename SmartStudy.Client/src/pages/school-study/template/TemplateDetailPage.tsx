import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGetPlanTemplateById,
  usePlanTemplate,
} from "@/hooks/entities/usePlanTemplate.ts";
import CloneTemplateDialog from "@/components/features/plan/CloneTemplateDialog";
import { useAuthStore } from "@/stores/useAuthStore";
import type { PlanTemplateDetailDto } from "@/services/api";

type DetailCourse = NonNullable<PlanTemplateDetailDto["courses"]>[number];
type DetailPhase = NonNullable<DetailCourse["phases"]>[number];
type DetailItem = NonNullable<DetailPhase["items"]>[number];

const getTypeLabel = (type?: string) =>
  type === "Personal" ? "Kế hoạch cá nhân" : "Lộ trình đại học";

const getCourseDescription = (course: DetailCourse) => {
  const text = course.description?.trim();
  if (text) {
    return text;
  }

  return `Lộ trình học tập môn ${course.name || "này"} được tối ưu hóa theo giai đoạn.`;
};

const getPhaseDateLabel = (phase: DetailPhase) => {
  const startDay = Number(phase.startDayOffset ?? 0);
  const hasEnd =
    phase.endDayOffset !== null && phase.endDayOffset !== undefined;
  const endDay = hasEnd ? Number(phase.endDayOffset) : startDay;
  if (phase.type === "General") {
    return "Giai đoạn chung";
  }

  return `Ngày ${startDay} - Ngày ${endDay}`;
};

const getRoutineLine = (item: DetailItem) => {
  const totalSessions = Number(item.totalSessions ?? 0);
  const durationDays = Number(item.durationDays ?? 0);
  return `${item.name || "Routine"} • ${totalSessions} buổi học • Diễn ra trong ${durationDays} ngày.`;
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
  const [searchParams] = useSearchParams();
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [selectedCourseRefs, setSelectedCourseRefs] = useState<string[]>([]);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isPreviewMode = searchParams.get("mode") === "preview";
  const { importSelectedCourses, importSelectedCoursesMutation } =
    usePlanTemplate();

  const parsedTemplateId = Number(templateId);
  const { data, isLoading, error } = useGetPlanTemplateById(parsedTemplateId);

  const courseCount = data?.courseCount ?? 0;
  const durationDays = data?.durationDays ?? 0;
  const phaseCount = data?.phaseCount ?? 0;
  const milestoneCount = data?.milestoneCount ?? 0;

  const courses = useMemo(() => data?.courses ?? [], [data]);

  const canImport =
    !isAdmin &&
    !isPreviewMode &&
    selectedCourseRefs.length > 0 &&
    !importSelectedCoursesMutation.isPending;

  const toggleCourseRef = (courseRef: string) => {
    setSelectedCourseRefs((prev) =>
      prev.includes(courseRef)
        ? prev.filter((item) => item !== courseRef)
        : [...prev, courseRef],
    );
  };

  const handleImportSelectedCourses = async () => {
    if (selectedCourseRefs.length === 0) {
      return;
    }

    await importSelectedCourses({
      templateId: parsedTemplateId,
      targetPlanId: 0,
      courseRefs: selectedCourseRefs,
    });

    setSelectedCourseRefs([]);
  };

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
      <div className="rounded-xl border bg-slate-50 p-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{data.name}</h1>
          <p className="text-sm text-slate-600">
            {data.description || "Template chưa có mô tả"}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{getTypeLabel(data.type)}</Badge>
            {isPreviewMode ? <Badge variant="secondary">Preview</Badge> : null}
            <Badge variant="secondary">{courseCount} môn học</Badge>
            <Badge variant="secondary">{phaseCount} giai đoạn</Badge>
            <Badge variant="secondary">{milestoneCount} cột mốc</Badge>
            <Badge variant="secondary">{durationDays} ngày</Badge>
            {data.universityTag ? (
              <Badge variant="outline">{data.universityTag}</Badge>
            ) : null}
            {data.majorTag ? (
              <Badge variant="outline">{data.majorTag}</Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={
          isPreviewMode
            ? "grid grid-cols-1 gap-6"
            : "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
        }
      >
        <div className="space-y-3">
          {courses.length === 0 ? (
            <div className="rounded border bg-muted/40 p-4 text-sm text-muted-foreground">
              Template này chưa có dữ liệu môn học.
            </div>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={courses.map((_, index) => `course-${index}`)}
              className="space-y-3"
            >
              {courses.map((course, courseIndex) => (
                <AccordionItem
                  key={`${course.ref || course.name || "course"}-${courseIndex}`}
                  value={`course-${courseIndex}`}
                  className="rounded-lg border bg-background px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="space-y-1 text-left">
                      <h3 className="text-base font-semibold">
                        {course.name || `Môn ${courseIndex + 1}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.subjectCode
                          ? `Mã môn: ${course.subjectCode}`
                          : "Chưa có mã môn"}
                      </p>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="space-y-4 pb-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      {getCourseDescription(course)}
                    </p>

                    {(course.phases ?? []).length === 0 ? (
                      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                        Môn học này chưa có giai đoạn.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(course.phases ?? []).map((phase, phaseIndex) => (
                          <div
                            key={`${phase.ref || phase.title || "phase"}-${phaseIndex}`}
                            className="rounded-md border bg-slate-50 p-3"
                          >
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-800">
                                {phase.title || "Giai đoạn"}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {getPhaseDateLabel(phase)}
                              </Badge>
                            </div>

                            {(phase.items ?? []).length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                Chưa có item trong giai đoạn này.
                              </p>
                            ) : (
                              <ul className="space-y-2">
                                {(phase.items ?? []).map((item, itemIndex) => (
                                  <li
                                    key={`${item.name || "item"}-${itemIndex}`}
                                    className="rounded border bg-white px-3 py-2 text-sm"
                                  >
                                    {item.itemType === "Milestone" ? (
                                      <p className="font-medium text-slate-800">
                                        ⚑ {item.name}
                                      </p>
                                    ) : (
                                      <p className="text-slate-700">
                                        {getRoutineLine(item)}
                                      </p>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {!isAdmin && !isPreviewMode ? (
          <div className="h-fit space-y-4 rounded-xl border bg-white p-4">
            <div>
              <h2 className="text-base font-semibold">Import môn học</h2>
              <p className="text-sm text-muted-foreground">
                Chọn môn để import vào kế hoạch đang hoạt động cùng loại.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Danh sách môn</p>
              <div className="max-h-60 space-y-2 overflow-auto rounded-md border p-2">
                {courses.map((course, courseIndex) => {
                  const courseRef =
                    course.ref || course.name || `course-${courseIndex}`;
                  const isChecked = selectedCourseRefs.includes(courseRef);
                  return (
                    <label
                      key={courseRef}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleCourseRef(courseRef)}
                      />
                      <span>{course.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleImportSelectedCourses}
              disabled={!canImport}
            >
              {importSelectedCoursesMutation.isPending
                ? "Đang import..."
                : "Import"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCloneDialogOpen(true)}
            >
              Dùng toàn bộ template
            </Button>
          </div>
        ) : null}
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
