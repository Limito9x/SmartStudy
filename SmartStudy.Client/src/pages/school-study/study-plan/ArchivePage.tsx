import AcademicContext from "@/components/features/plan/AcademicContext";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import {
  getCoursesOptions,
  getStudyPlanStatsOptions,
} from "@/services/api/@tanstack/react-query.gen";
import type { ResponseStudyPlanDto } from "@/services/api";
import { useQueries } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArchiveYearGroup from "./components/ArchiveYearGroup";

type ArchiveTypeFilter = "all" | "Academic" | "Personal";

interface GroupedPlans {
  yearLabel: string;
  plans: ResponseStudyPlanDto[];
  sortKey: number;
}

const toNumber = (value?: number | string | null) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getYearLabel = (plan: ResponseStudyPlanDto) => {
  const start = new Date(plan.startDate);
  const end = new Date(plan.endDate || plan.startDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Năm học khác";
  }

  return `${start.getFullYear()} - ${end.getFullYear()}`;
};

const getSortKey = (yearLabel: string) => {
  const startYear = Number(yearLabel.split(" - ")[0]);
  return Number.isFinite(startYear) ? startYear : 0;
};

export default function ArchivePage() {
  const navigate = useNavigate();
  const { getAllStudyPlans, updateStudyPlanStatus, getAcademicContext } =
    useStudyPlan();

  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<ArchiveTypeFilter>("all");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [restoringPlanId, setRestoringPlanId] = useState<number | null>(null);

  const { data: allPlans, isLoading, error } = getAllStudyPlans();
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

  const statsQueries = useQueries({
    queries: filteredPlans.map((plan) => {
      const planId = Number(plan.id);
      return {
        ...getStudyPlanStatsOptions({
          path: { planId },
        }),
        enabled: planId > 0,
      };
    }),
  });

  const courseQueries = useQueries({
    queries: filteredPlans.map((plan) => {
      const studyPlanId = Number(plan.id);
      return {
        ...getCoursesOptions({
          query: { studyPlanId },
        }),
        enabled: studyPlanId > 0,
      };
    }),
  });

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
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
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

  const metaByPlanId = useMemo(() => {
    const map = new Map<
      number,
      { courseCount: number; progressPercent: number }
    >();

    filteredPlans.forEach((plan, index) => {
      const planId = Number(plan.id);
      const stats = statsQueries[index]?.data;
      const courses = courseQueries[index]?.data || [];

      const totalTasks = toNumber(stats?.totalTasks);
      const completedTasks = toNumber(stats?.completedTasks);

      const progressPercent =
        totalTasks > 0
          ? Math.round((completedTasks / totalTasks) * 100)
          : plan.status === "Completed"
            ? 100
            : 0;

      map.set(planId, {
        courseCount: courses.length,
        progressPercent: Math.max(0, Math.min(100, progressPercent)),
      });
    });

    return map;
  }, [filteredPlans, statsQueries, courseQueries]);

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

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Kho lưu trữ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {completedCount} kế hoạch đã hoàn thành
        </p>
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

      <div className="rounded-lg border p-3">
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
                metaByPlanId={metaByPlanId}
                restoringPlanId={restoringPlanId}
                onOpenPlan={(plan) => navigate(`/app/study-plans/${plan.id}`)}
                onRestorePlan={handleRestorePlan}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
