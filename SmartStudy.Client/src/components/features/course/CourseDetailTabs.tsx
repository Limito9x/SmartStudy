import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  CourseWorkloadDto,
  CourseAssetResponseDto,
  ResponseCourseDto,
  SimpleResponseRoutineDto,
} from "@/services/api";
import WorkloadsTab from "@/components/features/course-workloads/WorkloadsTab";
import OverviewTab from "@/components/features/course-tabs/OverviewTab";
import AssetsVaultTab from "@/components/features/course-tabs/AssetsVaultTab";

interface CourseDetailTabsProps {
  course: ResponseCourseDto | null | undefined;
  routines: SimpleResponseRoutineDto[];
  workloads: CourseWorkloadDto | null | undefined;
  assets: CourseAssetResponseDto[];
}

export default function CourseDetailTabs({
  course,
  routines,
  workloads,
  assets,
}: CourseDetailTabsProps) {
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
            Tiến độ & Công việc
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className=" border-transparent px-4 pb-2.5 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Tài liệu
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <TabsContent value="overview" className="mt-6">
          <OverviewTab course={course} routines={routines} />
        </TabsContent>

        <TabsContent value="workloads" className="mt-6">
          <WorkloadsTab data={workloads} courseId={Number(course?.id)} />
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <AssetsVaultTab assets={assets} courseId={Number(course?.id ?? 0)} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
