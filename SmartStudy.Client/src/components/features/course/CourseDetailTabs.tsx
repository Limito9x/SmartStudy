import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ResponseCourseDto, StudyPlanType } from "@/services/api";
import WorkloadsTab from "@/components/features/course-workloads/WorkloadsTab";
import OverviewTab from "@/components/features/course-tabs/OverviewTab";
import AssetsVaultTab from "@/components/features/course-tabs/AssetsVaultTab";
import { useQuery } from "@tanstack/react-query";
import { getCourseWorkloadOptions } from "@/services/api/@tanstack/react-query.gen";

interface CourseDetailTabsProps {
  course: ResponseCourseDto | null | undefined;
  courseId: number;
  studyPlanId: number;
  studyPlanType: StudyPlanType;
}

export default function CourseDetailTabs({
  course,
  courseId,
  studyPlanId,
  studyPlanType,
}: CourseDetailTabsProps) {
  const workloadQuery = useQuery({
    ...getCourseWorkloadOptions({
      path: { courseId },
    }),
    enabled: !!courseId,
  });

  return (
    <Tabs
      defaultValue="overview"
      className="flex h-full min-h-0 w-full flex-col"
    >
      <div className="shrink-0 flex flex-col gap-3 border-b pb-0 md:flex-row md:items-end md:justify-between">
        <TabsList className="h-auto w-full justify-start gap-0 bg-transparent p-0 md:w-auto">
          <TabsTrigger
            value="overview"
            className=" border-transparent px-4 pb-2.5 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value="workloads"
            className=" border-transparent px-4 pb-2.5 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Công việc
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className=" border-transparent px-4 pb-2.5 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Tài liệu
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            course={course}
            courseId={courseId}
            studyPlanId={studyPlanId}
            studyPlanType={studyPlanType}
            workloadPhases={workloadQuery.data?.phases ?? []}
            isWorkloadLoading={workloadQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="workloads" className="mt-6">
          <WorkloadsTab courseId={courseId} />
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <AssetsVaultTab courseId={courseId} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
