import { Button } from "@/components/ui/button";
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
import { useDialogStore } from "@/stores/useDialogStore";

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
  const { openDialog } = useDialogStore();
  const handleOpenCreateRoutine = () => {
    openDialog("ROUTINE_FORM",{
      courseId: Number(course?.id ?? 0),
    })
  };

  const handleOpenCreateTask = () => {
    openDialog("TASK_FORM", {
      courseId: Number(course?.id ?? 0),
    })
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className="flex flex-col gap-3 border-b pb-0 md:flex-row md:items-end md:justify-between">
        <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0 md:w-auto">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value="workloads"
            className="rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Tiến độ & Công việc
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="rounded-none border-b-2 border-transparent px-4 pb-2.5 pt-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Tài liệu
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-6">
        <OverviewTab course={course} routines={routines} />
      </TabsContent>

      <TabsContent value="workloads" className="mt-6">
        <WorkloadsTab data={workloads} courseId={Number(course?.id)}/>
      </TabsContent>

      <TabsContent value="assets" className="mt-6">
        <AssetsVaultTab assets={assets} courseId={Number(course?.id ?? 0)} />
      </TabsContent>
    </Tabs>
  );
}
