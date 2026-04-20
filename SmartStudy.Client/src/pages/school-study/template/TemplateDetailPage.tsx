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
import { Separator } from "@/components/ui/separator";
import {
  useGetPlanTemplateById,
  useGetPlanTemplatePreviewBySourcePlan,
} from "@/hooks/entities/usePlanTemplate.ts";
import CloneTemplateDialog from "@/components/features/plan/CloneTemplateDialog";
import AssetItem from "@/components/files/AssetItem";
import { useAuthStore } from "@/stores/useAuthStore";
import { CalendarClock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanTemplateDetailDto } from "@/services/api";

type DetailItem = {
  name?: string | null;
  itemType?: number | string | null;
  totalSessions?: number | string | null;
  durationDays?: number | string | null;
};

type DetailPhase = {
  ref?: string | null;
  title?: string | null;
  type?: string | null;
  priority?: number | string | null;
  startDayOffset?: number | string | null;
  endDayOffset?: number | string | null;
  items?: DetailItem[] | null;
};

type DetailCourse = {
  ref?: string | null;
  name?: string | null;
  subjectCode?: string | null;
  subjectCredits?: number | string | null;
  description?: string | null;
  goal?: string | null;
  targetScore?: number | string | null;
  assets?: DetailCourseAsset[] | null;
  phases?: DetailPhase[] | null;
};

type DetailCourseAsset = {
  id?: number | string;
  fileName?: string | null;
  url?: string | null;
  type?: number | string | null;
  createdAt?: string | null;
};

type TemplateDetailViewModel = PlanTemplateDetailDto & {
  courses?: DetailCourse[];
  type?: string;
  universityTag?: string | null;
  majorTag?: string | null;
};

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
    return "Cả khóa học";
  }

  return `Ngày ${startDay} - Ngày ${endDay}`;
};

const getPriorityBorderClass = (priority?: number | string | null) => {
  if (priority === 3 || String(priority).toLowerCase() === "high") {
    return "border-l-rose-500";
  }

  if (priority === 2 || String(priority).toLowerCase() === "medium") {
    return "border-l-amber-500";
  }

  return "border-l-sky-500";
};

const isGeneralPhase = (phase: DetailPhase) => {
  const title = (phase.title ?? "").trim().toLowerCase();
  return phase.type === "General" || title === "general";
};

const isMilestoneItem = (item: DetailItem) => {
  const normalizedType = String(item.itemType ?? "").toLowerCase();
  const normalizedName = (item.name ?? "").trim().toLowerCase();

  return (
    item.itemType === 1 ||
    normalizedType === "1" ||
    normalizedType === "milestone" ||
    normalizedName.startsWith("deadline")
  );
};

const extractStudyPlanId = (data: unknown): number | null => {
  if (!data || typeof data !== "object") {
    return null;
  }

  const maybeData = data as Record<string, unknown>;
  const idCandidate =
    maybeData.targetPlanId ??
    maybeData.studyPlanId ??
    maybeData.id ??
    maybeData.createdStudyPlanId;

  const parseNumericId = (value: unknown): number | null => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  };

  const parsedDirectId = parseNumericId(idCandidate);
  if (parsedDirectId) {
    return parsedDirectId;
  }

  const newPlanIdValue = maybeData.newPlanId;
  const parsedNewPlanId = parseNumericId(newPlanIdValue);
  if (parsedNewPlanId) {
    return parsedNewPlanId;
  }

  if (newPlanIdValue && typeof newPlanIdValue === "object") {
    const nestedData = newPlanIdValue as Record<string, unknown>;
    const parsedNestedId = parseNumericId(
      nestedData.studyPlanId ?? nestedData.id ?? nestedData.createdStudyPlanId,
    );
    if (parsedNestedId) {
      return parsedNestedId;
    }
  }

  return null;
};

export default function TemplateDetailPage() {
  const navigate = useNavigate();
  const { templateId, sourcePlanId } = useParams();
  const [searchParams] = useSearchParams();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedCourseRefs, setSelectedCourseRefs] = useState<string[]>([]);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const parsedTemplateId = Number(templateId);
  const parsedSourcePlanId = Number(sourcePlanId);
  const isRoutePreview =
    Number.isFinite(parsedSourcePlanId) && parsedSourcePlanId > 0;
  const isPreviewMode =
    searchParams.get("mode") === "preview" || isRoutePreview;

  const templateDetailQuery = useGetPlanTemplateById(parsedTemplateId);
  const previewQuery =
    useGetPlanTemplatePreviewBySourcePlan(parsedSourcePlanId);

  const activeQuery = isRoutePreview ? previewQuery : templateDetailQuery;
  const detailData = activeQuery.data as TemplateDetailViewModel | undefined;
  const isLoading = activeQuery.isLoading;
  const error = activeQuery.error;

  const courseCount = detailData?.courseCount ?? 0;
  const durationDays = detailData?.durationDays ?? 0;
  const phaseCount = detailData?.phaseCount ?? 0;
  const milestoneCount = detailData?.milestoneCount ?? 0;

  const courses = useMemo<DetailCourse[]>(
    () => (detailData?.courses as DetailCourse[] | undefined) ?? [],
    [detailData],
  );

  const canApply =
    !isAdmin &&
    !isPreviewMode &&
    !isRoutePreview &&
    selectedCourseRefs.length > 0;

  const toggleCourseRef = (courseRef: string) => {
    setSelectedCourseRefs((prev) =>
      prev.includes(courseRef)
        ? prev.filter((item) => item !== courseRef)
        : [...prev, courseRef],
    );
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

  if (error || !detailData) {
    return (
      <div className="p-6">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          Không thể tải chi tiết template.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6 overflow-y-auto p-6">
      <div className="rounded-xl border bg-slate-50 p-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{detailData.name}</h1>
          <p className="text-sm text-slate-600">
            {detailData.description || "Template chưa có mô tả"}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{getTypeLabel(detailData.type)}</Badge>
            {isPreviewMode ? <Badge variant="secondary">Preview</Badge> : null}
            <Badge variant="secondary">{courseCount} môn học</Badge>
            <Badge variant="secondary">{phaseCount} giai đoạn</Badge>
            <Badge variant="secondary">{milestoneCount} cột mốc</Badge>
            <Badge variant="secondary">{durationDays} ngày</Badge>
            {detailData.universityTag ? (
              <Badge variant="outline">{detailData.universityTag}</Badge>
            ) : null}
            {detailData.majorTag ? (
              <Badge variant="outline">{detailData.majorTag}</Badge>
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
                        {[
                          course.subjectCode
                            ? `Mã môn: ${course.subjectCode}`
                            : "Chưa có mã môn",
                          detailData.type === "Academic" &&
                          course.subjectCredits !== null &&
                          course.subjectCredits !== undefined &&
                          course.subjectCredits !== ""
                            ? `${course.subjectCredits} tín chỉ`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="space-y-4 pb-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      {getCourseDescription(course)}
                    </p>

                    {course.goal?.trim() ||
                    (course.targetScore !== null &&
                      course.targetScore !== undefined) ? (
                      <div className="flex flex-wrap items-center gap-2 rounded-md border border-sky-100 bg-sky-50/60 p-3">
                        {course.goal?.trim() ? (
                          <Badge
                            variant="outline"
                            className="border-sky-200 text-sky-700"
                          >
                            Mục tiêu: {course.goal}
                          </Badge>
                        ) : null}
                        {course.targetScore !== null &&
                        course.targetScore !== undefined ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 text-emerald-700"
                          >
                            Điểm mục tiêu: {course.targetScore}
                          </Badge>
                        ) : null}
                      </div>
                    ) : null}

                    {(course.assets ?? []).length > 0 ? (
                      <div className="space-y-2.5 rounded-md border bg-slate-50/60 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Tài liệu môn học
                          </p>
                          <Badge variant="secondary" className="text-[11px]">
                            {(course.assets ?? []).length} tệp
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {(course.assets ?? []).map((asset, assetIndex) => (
                            <AssetItem
                              key={`${asset.id ?? asset.fileName ?? "asset"}-${assetIndex}`}
                              asset={{
                                id: asset.id,
                                fileName: asset.fileName ?? undefined,
                                url: asset.url ?? undefined,
                                type: asset.type ?? undefined,
                                createdAt: asset.createdAt ?? undefined,
                                linkedType: "Course",
                              }}
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {(course.phases ?? []).length === 0 ? (
                      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                        Môn học này chưa có giai đoạn.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(course.phases ?? []).map((phase, phaseIndex) => (
                          <div
                            key={`${phase.ref || phase.title || "phase"}-${phaseIndex}`}
                            className={cn(
                              "rounded-md border border-l-4 bg-slate-50 p-3 sm:p-4",
                              getPriorityBorderClass(phase.priority),
                            )}
                          >
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-800">
                                {phase.title || "Giai đoạn"}
                              </p>
                              {isGeneralPhase(phase) ? (
                                <Badge
                                  variant="secondary"
                                  className="border border-amber-200 bg-amber-50 text-amber-700"
                                >
                                  Giai đoạn chung
                                </Badge>
                              ) : null}
                              <Badge variant="outline" className="text-xs">
                                {getPhaseDateLabel(phase)}
                              </Badge>
                            </div>

                            {(phase.items ?? []).length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                Chưa có item trong giai đoạn này.
                              </p>
                            ) : (
                              (() => {
                                const routines = (phase.items ?? []).filter(
                                  (item) => !isMilestoneItem(item),
                                );
                                const milestones = (phase.items ?? []).filter(
                                  (item) => isMilestoneItem(item),
                                );

                                return (
                                  <div className="space-y-4">
                                    <div className="space-y-2.5">
                                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Lịch học định kỳ
                                      </p>
                                      {routines.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                          Chưa có routine trong giai đoạn này.
                                        </p>
                                      ) : (
                                        <ul className="space-y-3">
                                          {routines.map((item, itemIndex) => {
                                            const totalSessions = Number(
                                              item.totalSessions ?? 0,
                                            );
                                            const durationDays = Number(
                                              item.durationDays ?? 0,
                                            );

                                            return (
                                              <li
                                                key={`${item.name || "routine"}-${itemIndex}`}
                                                className="rounded border bg-white px-3 py-3 text-sm"
                                              >
                                                <div className="flex items-start gap-2.5">
                                                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                                                  <div className="space-y-1">
                                                    <p className="font-medium text-slate-800">
                                                      {item.name || "Routine"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                      {totalSessions} buổi học •
                                                      Diễn ra trong{" "}
                                                      {durationDays} ngày
                                                    </p>
                                                  </div>
                                                </div>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      )}
                                    </div>

                                    <Separator />

                                    <div className="space-y-2.5">
                                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Cột mốc quan trọng
                                      </p>
                                      {milestones.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                          Chưa có milestone trong giai đoạn này.
                                        </p>
                                      ) : (
                                        <ul className="space-y-3">
                                          {milestones.map((item, itemIndex) => (
                                            <li
                                              key={`${item.name || "milestone"}-${itemIndex}`}
                                              className="rounded border bg-white px-3 py-3 text-sm"
                                            >
                                              <div className="flex items-start gap-2.5">
                                                <Flag className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                                <div>
                                                  <p className="font-medium text-slate-800">
                                                    {item.name || "Milestone"}
                                                  </p>
                                                </div>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()
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
              <h2 className="text-base font-semibold">Áp dụng vào KHHT</h2>
              <p className="text-sm text-muted-foreground">
                Chọn môn học rồi áp dụng template vào KHHT phù hợp.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Danh sách môn</p>
              <div className="space-y-2 rounded-md border p-2">
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
              onClick={() => setIsApplyDialogOpen(true)}
              disabled={!canApply}
            >
              Áp dụng
            </Button>
          </div>
        ) : null}
      </div>

      {!isAdmin ? (
        <CloneTemplateDialog
          open={isApplyDialogOpen}
          onOpenChange={setIsApplyDialogOpen}
          templateId={parsedTemplateId}
          templateType={
            detailData.type === "Personal" ? "Personal" : "Academic"
          }
          selectedCourseRefs={selectedCourseRefs}
          defaultPlanName={detailData.name || undefined}
          onApplySuccess={(response) => {
            setSelectedCourseRefs([]);
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
