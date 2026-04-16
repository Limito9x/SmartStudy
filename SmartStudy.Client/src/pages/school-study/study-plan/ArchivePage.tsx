import AcademicContext from "@/components/features/plan/AcademicContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreatePlanTemplate,
  useUpdatePlanTemplate,
} from "@/hooks/entities/usePlanTemplate";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import {
  getCoursesQueryKey,
  getStudyPlansQueryKey,
  updateCourseFinalScoreMutation,
} from "@/services/api/@tanstack/react-query.gen";
import type { ResponseStudyPlanDto } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, BarChart3, GraduationCap, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ArchiveYearGroup from "../../../components/features/plan/ArchiveYearGroup";

type ArchiveTypeFilter = "all" | "Academic" | "Personal";

interface GroupedPlans {
  yearLabel: string;
  plans: ResponseStudyPlanDto[];
  sortKey: number;
}

const getYearLabel = (plan: ResponseStudyPlanDto) => {
  const start = new Date(plan.startDate || "");
  const end = new Date(plan.endDate || plan.startDate || "");

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Năm học khác";
  }

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    return String(startYear);
  }

  return `${startYear} - ${endYear}`;
};

const getSortKey = (yearLabel: string) => {
  const startYear = Number(yearLabel.split(" - ")[0]);
  return Number.isFinite(startYear) ? startYear : 0;
};

export default function ArchivePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    getAllStudyPlans,
    updateStudyPlanStatus,
    getAcademicContext,
    getSummaryPlanProgress,
  } = useStudyPlan();
  const createPlanTemplate = useCreatePlanTemplate();
  const updatePlanTemplate = useUpdatePlanTemplate();

  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<ArchiveTypeFilter>("all");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [restoringPlanId, setRestoringPlanId] = useState<number | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [savingCourseId, setSavingCourseId] = useState<number | null>(null);
  const [previewingPlanId, setPreviewingPlanId] = useState<number | null>(null);
  const [publishingPlanId, setPublishingPlanId] = useState<number | null>(null);

  const updateCourseFinalScore = useMutation({
    ...updateCourseFinalScoreMutation(),
  });

  const { data: allPlans, isLoading, error } = getAllStudyPlans();
  const summaryProgress = getSummaryPlanProgress.data;
  const academicContext = getAcademicContext.data;

  const archivePlans = useMemo(() => {
    return (allPlans || []).filter(
      (plan) => plan.status === "Completed" || plan.status === "Archived",
    );
  }, [allPlans]);

  const completedCount = useMemo(() => {
    return archivePlans.filter((plan) => plan.status === "Completed").length;
  }, [archivePlans]);

  const filteredPlans = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return archivePlans.filter((plan) => {
      if (selectedType !== "all" && String(plan.type || "") !== selectedType) {
        return false;
      }

      if (selectedType === "Academic") {
        if (selectedTerm && String(plan.termId ?? "") !== selectedTerm) {
          return false;
        }
        if (selectedYear && String(plan.yearId ?? "") !== selectedYear) {
          return false;
        }
      }

      if (!keyword) return true;
      return String(plan.name || "")
        .toLowerCase()
        .includes(keyword);
    });
  }, [archivePlans, searchText, selectedType, selectedTerm, selectedYear]);

  const groupedPlans = useMemo(() => {
    const map = new Map<string, GroupedPlans>();

    filteredPlans.forEach((plan) => {
      const yearLabel = getYearLabel(plan);
      const currentGroup = map.get(yearLabel);

      if (!currentGroup) {
        map.set(yearLabel, {
          yearLabel,
          sortKey: getSortKey(yearLabel),
          plans: [plan],
        });
        return;
      }

      currentGroup.plans.push(plan);
    });

    return Array.from(map.values())
      .map((group) => ({
        ...group,
        plans: [...group.plans].sort(
          (a, b) =>
            new Date(b.startDate || "").getTime() -
            new Date(a.startDate || "").getTime(),
        ),
      }))
      .sort((a, b) => b.sortKey - a.sortKey);
  }, [filteredPlans]);

  const termYearByPlanId = useMemo(() => {
    const termMap = new Map(
      (academicContext?.terms || []).map((term) => [
        String(term.id ?? ""),
        String(term.name || `HK ${term.termNumber ?? "-"}`),
      ]),
    );
    const yearMap = new Map(
      (academicContext?.years || []).map((year) => [
        String(year.id ?? ""),
        String(year.name || year.startYear || "Năm học"),
      ]),
    );

    const map = new Map<number, string>();
    filteredPlans.forEach((plan) => {
      const planId = Number(plan.id);
      const termLabel = termMap.get(String(plan.termId ?? "")) || "HK -";
      const yearLabel =
        yearMap.get(String(plan.yearId ?? "")) || getYearLabel(plan);
      map.set(planId, `${termLabel} - ${yearLabel}`);
    });

    return map;
  }, [filteredPlans, academicContext]);

  const handleRestorePlan = (plan: ResponseStudyPlanDto) => {
    const planId = Number(plan.id);
    if (!planId) return;

    setRestoringPlanId(planId);
    updateStudyPlanStatus.mutate(
      {
        path: { planId },
        body: { status: "Active" },
      },
      {
        onSettled: () => {
          setRestoringPlanId(null);
        },
      },
    );
  };

  const handleToggleExpand = (planId: number) => {
    setExpandedPlanId((current) => (current === planId ? null : planId));
  };

  const handleUpdateCourseFinalScore = async (
    planId: number,
    courseId: number,
    score: number,
  ) => {
    if (!planId || !courseId || !Number.isFinite(score)) {
      return;
    }

    try {
      setSavingCourseId(courseId);

      await updateCourseFinalScore.mutateAsync({
        path: { courseId },
        body: score,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getStudyPlansQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: getCoursesQueryKey({ query: { studyPlanId: planId } }),
        }),
      ]);
    } catch {
      toast.error("Không thể cập nhật điểm tổng kết.");
    } finally {
      setSavingCourseId(null);
    }
  };

  const upsertTemplateFromPlan = async (
    plan: ResponseStudyPlanDto,
    publish: boolean,
  ) => {
    const sourcePlanId = Number(plan.id);
    if (!sourcePlanId) {
      throw new Error("Không tìm thấy Study Plan ID hợp lệ.");
    }

    const createdOrUpdated = await createPlanTemplate.mutateAsync({
      body: {
        sourcePlanId,
        name: plan.name || null,
        description: null,
        isPublic: publish,
      },
    });

    const templateId = Number(createdOrUpdated?.id);
    if (!templateId) {
      throw new Error("Không lấy được Template ID sau khi tạo.");
    }

    if (publish && !createdOrUpdated?.isPublic) {
      await updatePlanTemplate.mutateAsync({
        path: { templateId },
        body: {
          name:
            createdOrUpdated.name ||
            plan.name ||
            `Template từ plan ${sourcePlanId}`,
          description: createdOrUpdated.description ?? null,
          isPublic: true,
        },
      });
    }

    return templateId;
  };

  const handlePreviewTemplate = async (plan: ResponseStudyPlanDto) => {
    const planId = Number(plan.id);
    if (!planId) {
      return;
    }

    try {
      setPreviewingPlanId(planId);
      const templateId = await upsertTemplateFromPlan(plan, false);
      navigate(`/app/templates/${templateId}?mode=preview`);
    } catch {
      toast.error("Không thể mở preview template cho kế hoạch này.");
    } finally {
      setPreviewingPlanId(null);
    }
  };

  const handlePublishTemplate = async (plan: ResponseStudyPlanDto) => {
    const planId = Number(plan.id);
    if (!planId) {
      return;
    }

    try {
      setPublishingPlanId(planId);
      await upsertTemplateFromPlan(plan, true);
      toast.success("Đã public template từ kế hoạch hoàn tất.");
    } catch {
      toast.error("Không thể public template cho kế hoạch này.");
    } finally {
      setPublishingPlanId(null);
    }
  };

  return (
    <div className="h-full space-y-4 overflow-y-auto p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr),420px] lg:items-start">
        <div className="text-left">
          <h1 className="text-left text-2xl font-semibold text-slate-900">
            Kho lưu trữ
          </h1>
          <p className="mt-1 text-left text-sm text-muted-foreground">
            Quản lý kế hoạch đã hoàn thành và chỉnh sửa điểm nhanh ngay tại danh
            sách.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Kế hoạch hoàn thành
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {completedCount}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <Archive className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Tín chỉ tích lũy
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {Number(summaryProgress?.totalCredits ?? 0)}
                </p>
              </div>
              <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
                <GraduationCap className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">GPA</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {Number(summaryProgress?.gpa ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
                <BarChart3 className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="pl-9"
              placeholder="Tìm kế hoạch..."
            />
          </div>

          <Tabs
            value={selectedType}
            onValueChange={(value) =>
              setSelectedType((value || "all") as ArchiveTypeFilter)
            }
          >
            <TabsList variant="line" className="rounded-md border p-0">
              <TabsTrigger value="all" className="px-4 py-2 text-sm">
                Tất cả
              </TabsTrigger>
              <TabsTrigger value="Academic" className="px-4 py-2 text-sm">
                Đại học
              </TabsTrigger>
              <TabsTrigger value="Personal" className="px-4 py-2 text-sm">
                Cá nhân
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {selectedType === "Academic" ? (
          <div className="rounded-md border bg-slate-50 p-3">
            <AcademicContext
              selectedTerm={selectedTerm}
              onTermChange={setSelectedTerm}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-18 w-full" />
          <Skeleton className="h-18 w-full" />
          <Skeleton className="h-18 w-full" />
        </div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-destructive">
          Không thể tải danh sách kho lưu trữ.
        </p>
      ) : groupedPlans.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Không có kế hoạch phù hợp với bộ lọc hiện tại.
        </p>
      ) : (
        <div className="space-y-4">
          {groupedPlans.map((group) => (
            <ArchiveYearGroup
              key={group.yearLabel}
              yearLabel={group.yearLabel}
              plans={group.plans}
              termYearByPlanId={termYearByPlanId}
              restoringPlanId={restoringPlanId}
              expandedPlanId={expandedPlanId}
              savingCourseId={savingCourseId}
              previewingPlanId={previewingPlanId}
              publishingPlanId={publishingPlanId}
              onToggleExpand={handleToggleExpand}
              onUpdateCourseFinalScore={handleUpdateCourseFinalScore}
              onRestorePlan={handleRestorePlan}
              onPreviewTemplate={handlePreviewTemplate}
              onPublishTemplate={handlePublishTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
