import { useOutletContext } from "react-router-dom";
import type { StudyPlanOutletContext } from "@/layouts/StudyPlanLayout";
import OverviewTab from "./OverviewTab";
import SchedulingTab from "./SchedulingTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function StudyPlanPage() {
  const { selectedStudyPlan } = useOutletContext<StudyPlanOutletContext>();

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
          {selectedStudyPlan && (
            <OverviewTab studyPlanId={Number(selectedStudyPlan.id)} />
          )}
        </TabsContent>

        <TabsContent
          value="scheduling"
          className="flex-1 min-h-0 overflow-hidden mt-2"
        >
          {selectedStudyPlan && (
            <SchedulingTab />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
