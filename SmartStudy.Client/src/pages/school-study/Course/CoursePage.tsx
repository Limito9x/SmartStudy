import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, User } from "lucide-react";
import CourseOverview from "./tabs/CourseOverviewTab";
import AssetsTab from "./tabs/AssetsTab";
import EventsTab from "./tabs/EventsTab";

interface TabItem {
  label: string;
  value: string;
  content: () => React.ReactNode;
}

const statusMap: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  Draft: { label: "Nháp", variant: "secondary" },
  Enrolled: { label: "Đang học", variant: "default" },
  Completed: { label: "Hoàn thành", variant: "outline" },
  Dropped: { label: "Đã huỷ", variant: "destructive" },
};

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const response = await getCourseById({ path: { courseId: courseId } });
      return response.data;
    },
    enabled: !!courseId,
  });

  const courseIdNum = Number(courseId);

  const TabItems: TabItem[] = [
    {
      label: "Tổng quan",
      value: "overview",
      content: () => <CourseOverview course={course} />,
    },
    {
      label: "Tài liệu",
      value: "assets",
      content: () => <AssetsTab courseId={courseIdNum} />,
    },
    {
      label: "Sự kiện",
      value: "events",
      content: () => <EventsTab courseId={courseIdNum} />,
    },
  ];

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
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-sm text-destructive">
          Lỗi tải dữ liệu: {error.message}
        </p>
      </div>
    );
  }

  const status = statusMap[course?.status ?? ""];

  return (
    <div className="max-w-8xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Quay lại
        </Button>
      </div>

      {course && (
        <>
          {/* Header card */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                <BookOpen size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight">
                    {course.name}
                  </h1>
                  {/* {status && (
                    <Badge variant={status.variant}>{status.label}</Badge>
                  )} */}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 gap-0">
              {TabItems.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2.5 pt-2 text-sm"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {TabItems.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                {tab.content()}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}
