import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getCourseAssetOptions,
  getCourseByIdOptions,
  getCourseWorkloadOptions,
  getRoutinesOptions,
} from "@/services/api/@tanstack/react-query.gen";
import type { SimpleResponseRoutineDto } from "@/services/api";
import CourseDetailTabs from "@/components/features/course/CourseDetailTabs";

export default function CoursePage() {
  const { courseId, studyPlanId } = useParams<{
    courseId: string;
    studyPlanId: string;
  }>();
  const navigate = useNavigate();
  const courseIdNum = Number(courseId);
  const studyPlanIdNum = Number(studyPlanId);

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

  const workloadQuery = useQuery({
    ...getCourseWorkloadOptions({
      path: {
        courseId: courseIdNum,
      },
      query: {
        search: "",
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
    workloadQuery.isLoading ||
    assetsQuery.isLoading;

  const error =
    courseQuery.error ||
    routinesQuery.error ||
    workloadQuery.error ||
    assetsQuery.error;

  const course = courseQuery.data;

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : "Không xác định";
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-4xl p-6">
          <p className="text-sm text-destructive">Lỗi tải dữ liệu: {message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-8xl space-y-6 p-6">
        <div className="flex">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/app/study-plans/${studyPlanIdNum}`)}
          >
            <ArrowLeft size={16} />
            Quay lại
          </Button>
        </div>

        {course ? (
          <CourseDetailTabs
            course={course}
            routines={(routinesQuery.data ?? []) as SimpleResponseRoutineDto[]}
            workloads={workloadQuery.data}
            assets={assetsQuery.data ?? []}
          />
        ) : null}
      </div>
    </div>
  );
}
