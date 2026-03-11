import { useOutletContext } from "react-router-dom";
import type { SemesterOutletContext } from "@/layouts/StudyPlanLayout";
import OverviewTab from "./OverviewTab";
import SchedulingTab from "./SchedulingTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function StudyPlanPage() {
  const { currentStudyPlan } = useOutletContext<SemesterOutletContext>();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs
        defaultValue="overview"
        className="flex-1 min-h-0 flex flex-col overflow-hidden"
      >
        <TabsList className="shrink-0 mx-4 mt-4 w-fit">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="scheduling">Sắp xếp lịch</TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 mt-2"
        >
          {currentStudyPlan && (
            <OverviewTab studyPlanId={Number(currentStudyPlan.id)} />
          )}
        </TabsContent>

        <TabsContent
          value="scheduling"
          className="flex-1 min-h-0 overflow-hidden mt-2"
        >
          {currentStudyPlan && (
            <SchedulingTab studyPlanId={Number(currentStudyPlan.id)} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
