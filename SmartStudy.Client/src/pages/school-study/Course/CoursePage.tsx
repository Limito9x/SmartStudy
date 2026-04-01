import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getCourseByIdOptions,
  getStudyPlanByIdOptions,
} from "@/services/api/@tanstack/react-query.gen";
import CourseDetailTabs from "@/components/features/course/CourseDetailTabs";
import CoursePanel from "@/components/panels/CoursePanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { usePanelStore } from "@/stores/usePanelStore";

export default function CoursePage() {
  const { courseId, studyPlanId } = useParams<{
    courseId: string;
    studyPlanId: string;
  }>();
  const navigate = useNavigate();
  const courseIdNum = Number(courseId);
  const studyPlanIdNum = Number(studyPlanId);
  const isMobile = useIsMobile();
  const { isOpen, type, openPanel, closePanel } = usePanelStore();

  const isChatOpen = isOpen && type === "CHAT";
  const isDesktopPanelOpen = !isMobile && isOpen;

  useEffect(() => {
    closePanel();
  }, [courseIdNum, closePanel]);

  const handleToggleChat = () => {
    if (isChatOpen) {
      closePanel();
      return;
    }

    openPanel("CHAT", {
      courseId: Number.isFinite(courseIdNum) ? courseIdNum : null,
    });
  };

  const courseQuery = useQuery({
    ...getCourseByIdOptions({
      path: {
        courseId: courseIdNum,
      },
    }),
    enabled: !!courseIdNum,
  });

  const studyPlanQuery = useQuery({
    ...getStudyPlanByIdOptions({
      path: {
        studyPlanId: studyPlanIdNum,
      },
    }),
    enabled: !!studyPlanIdNum,
  });

  const isLoading = courseQuery.isLoading;
  const error = courseQuery.error;

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
            onClick={handleToggleChat}
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
                "h-full min-h-0 min-w-0 transition-[width] duration-300 ease-in-out",
                isDesktopPanelOpen
                  ? "w-[calc(100%-clamp(320px,32vw,560px))]"
                  : "w-full",
              )}
            >
              {course && (
                <CourseDetailTabs
                  course={course}
                  courseId={courseIdNum}
                  studyPlanId={studyPlanIdNum}
                  studyPlanType={studyPlanQuery.data?.type ?? "Personal"}
                />
              )}
            </div>

            <div
              className={cn(
                "h-full overflow-hidden bg-background transition-all duration-300 ease-in-out",
                isDesktopPanelOpen
                  ? "w-[clamp(320px,32vw,560px)] border-l opacity-100"
                  : "w-0 border-l-0 opacity-0 pointer-events-none",
              )}
            >
              <div className="h-full min-h-0 overflow-hidden rounded-lg border">
                <CoursePanel mode="inline" fallbackCourseId={courseIdNum} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMobile ? (
        <CoursePanel mode="sheet" fallbackCourseId={courseIdNum} />
      ) : null}
    </div>
  );
}
