import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getCourseAssetOptions,
  getCourseByIdOptions,
  getEventsOptions,
  getRoutinesOptions,
  getTasksOptions,
} from "@/services/api/@tanstack/react-query.gen";
import type { SimpleResponseRoutineDto } from "@/services/api";
import CourseDetailTabs from "@/components/features/course/CourseDetailTabs";
import { useStudyPlanStore } from "@/stores/studyPlanStore";

export default function CoursePage() {
  const { activePlanId } = useStudyPlanStore();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseIdNum = Number(courseId);

  const courseQuery = useQuery({
    ...getCourseByIdOptions({
      path: {
        courseId: courseIdNum,
      },
    }),
    enabled: !!courseIdNum,
  });

  const routinesQuery = useQuery({
    ...getRoutinesOptions({
      query: {
        CourseId: courseIdNum,
      },
    }),
    enabled: !!courseIdNum,
  });

  const pendingTasksQuery = useQuery({
    ...getTasksOptions({
      query: {
        courseId: courseIdNum,
        status: "Pending",
      },
    }),
    enabled: !!courseIdNum,
  });

  const completedTasksQuery = useQuery({
    ...getTasksOptions({
      query: {
        courseId: courseIdNum,
        status: "Completed",
      },
    }),
    enabled: !!courseIdNum,
  });

  const eventsQuery = useQuery({
    ...getEventsOptions({
      query: {
        courseId: courseIdNum,
      },
    }),
    enabled: !!courseIdNum,
  });

  const assetsQuery = useQuery({
    ...getCourseAssetOptions({
      path: {
        courseId: courseIdNum,
      },
    }),
    enabled: !!courseIdNum,
  });

  const isLoading =
    courseQuery.isLoading ||
    routinesQuery.isLoading ||
    pendingTasksQuery.isLoading ||
    completedTasksQuery.isLoading ||
    eventsQuery.isLoading ||
    assetsQuery.isLoading;

  const error =
    courseQuery.error ||
    routinesQuery.error ||
    pendingTasksQuery.error ||
    completedTasksQuery.error ||
    eventsQuery.error ||
    assetsQuery.error;

  const course = courseQuery.data;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : "Không xác định";
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-sm text-destructive">Lỗi tải dữ liệu: {message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/app/study-plans/${activePlanId}`)}
        >
          <ArrowLeft size={16} />
          Quay lại
        </Button>
      </div>

      {course ? (
        <CourseDetailTabs
          course={course}
          routines={(routinesQuery.data ?? []) as SimpleResponseRoutineDto[]}
          pendingTasks={pendingTasksQuery.data ?? []}
          completedTasks={completedTasksQuery.data ?? []}
          timelineEvents={eventsQuery.data ?? []}
          assets={assetsQuery.data ?? []}
        />
      ) : null}
    </div>
  );
}
