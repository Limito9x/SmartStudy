import { type StudyPlanStatus } from "@/services/api";
import { useStudyPlan } from "@/hooks/entities/useStudyPlan";
import { type ResponseStudyPlanDto } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type StudyPlanStatusMap = Record<
  StudyPlanStatus,
  {
    text: string;
    color: string;
  }
>;

export type StudyPlanOutletContext = {
  studyPlans: ResponseStudyPlanDto[] | undefined;
  selectedStudyPlan: ResponseStudyPlanDto | null; // kỳ đang xem
};

export default function SchoolStudyLayout() {
  const navigate = useNavigate();
  
  const { data: studyPlans, isLoading } = useStudyPlan().getAllStudyPlans;

  const [selectedStudyPlan, setSelectedStudyPlan] =
    useState<ResponseStudyPlanDto | null>(null);

    useEffect(() => {
      if (studyPlans && !selectedStudyPlan) {
        setSelectedStudyPlan(studyPlans[0] ?? null);
      }
    }, [studyPlans]);

    const isScheduling = location.pathname.includes("scheduling");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 pt-4 shrink-0">
            {/* Tabs */}
            <nav className="flex gap-1">
              {[
                { label: "Tổng quan", key: "overview" },
              ].map(({ label, key }) => {
                const isActive =
                  key === "scheduling" ? isScheduling : !isScheduling;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (selectedStudyPlan) {
                        navigate(
                          `/app/study-plans/${selectedStudyPlan.id}/${key}`,
                        );
                      }
                    }}
                    className={`px-4 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${
                      isActive
                        ? "border-foreground text-foreground font-medium"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>

            <Select
              value={
                selectedStudyPlan ? selectedStudyPlan.id.toString() : undefined
              }
              onValueChange={(value) => {
                const plan = studyPlans?.find((s) => s.id.toString() === value);
                if (plan) {
                  setSelectedStudyPlan(plan);
                  navigate(`/app/study-plans/${plan.id}/overview`);
                }
              }}
            >
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="Chọn học kỳ" />
              </SelectTrigger>
              <SelectContent>
                {studyPlans?.map((studyPlan) => {
                  const title = studyPlan.name;
                  return (
                    <SelectItem
                      key={studyPlan.id}
                      value={studyPlan.id.toString()}
                    >
                      <div className="flex items-center">
                        {title}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-h-0 h-full overflow-hidden p-4">
            <Outlet
              context={{
                studyPlans,
                selectedStudyPlan, // kỳ đang xem
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
