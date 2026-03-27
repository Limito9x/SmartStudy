import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useState } from "react";
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
import { ChatContainer } from "@/components/chats/ChatDrawer";
import { cn } from "@/lib/utils";

export default function CoursePage() {
  const { courseId, studyPlanId } = useParams<{
    courseId: string;
    studyPlanId: string;
  }>();
  const navigate = useNavigate();
  const courseIdNum = Number(courseId);
  const studyPlanIdNum = Number(studyPlanId);
  const [isChatOpen, setIsChatOpen] = useState(true);

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
    <div className="h-full min-h-0 flex flex-col">
      <div className="mx-auto flex h-full w-full max-w-8xl min-h-0 flex-col gap-4 p-6">
        {/* Header row */}
        <div className="flex shrink-0 items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/app/study-plans/${studyPlanIdNum}`)}
          >
            <ArrowLeft size={16} />
            Quay lại
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsChatOpen((prev) => !prev)}
          >
            {isChatOpen ? (
              <PanelRightClose size={16} />
            ) : (
              <PanelRightOpen size={16} />
            )}
            {isChatOpen ? "Tắt AI chat" : "Bật AI chat"}
          </Button>
        </div>

        {/* ✅ flex-1 + min-h-0 để phần này chiếm hết không gian còn lại */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="flex h-full min-h-0 w-full">
            <div
              className={cn(
                "h-full min-h-0 min-w-0  transition-[width] duration-300 ease-in-out",
                isChatOpen
                  ? "w-[calc(100%-clamp(320px,32vw,560px))]"
                  : "w-full",
              )}
            >
              {course && (
                <CourseDetailTabs
                  course={course}
                  routines={
                    (routinesQuery.data ?? []) as SimpleResponseRoutineDto[]
                  }
                  workloads={workloadQuery.data}
                  assets={assetsQuery.data ?? []}
                />
              )}
            </div>

            <div
              className={cn(
                "h-full overflow-hidden bg-background transition-all duration-300 ease-in-out",
                isChatOpen
                  ? "w-[clamp(320px,32vw,560px)] border-l opacity-100"
                  : "w-0 border-l-0 opacity-0 pointer-events-none",
              )}
            >
              <div className="h-full min-h-0 overflow-hidden rounded-lg border">
                <ChatContainer courseId={courseIdNum} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
