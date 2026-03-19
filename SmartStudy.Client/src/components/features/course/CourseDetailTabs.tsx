import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Calendar,
  Clock,
  Download,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Target,
} from "lucide-react";
import type {
  CourseAssetResponseDto,
  ResponseCourseDto,
  ResponseTaskDto,
  ResponseTimelineEventDto,
  SimpleResponseRoutineDto,
} from "@/services/api";
import { weekdayMap } from "@/utils/calendar";
import { cn } from "@/lib/utils";
import AssetUploader from "@/components/files/AssetUploader";

interface CourseDetailTabsProps {
  course: ResponseCourseDto | null | undefined;
  routines: SimpleResponseRoutineDto[];
  pendingTasks: ResponseTaskDto[];
  completedTasks: ResponseTaskDto[];
  timelineEvents: ResponseTimelineEventDto[];
  assets: CourseAssetResponseDto[];
}

export default function CourseDetailTabs({
  course,
  routines,
  pendingTasks,
  completedTasks,
  timelineEvents,
  assets,
}: CourseDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 gap-0">
        <TabsTrigger
          value="overview"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2.5 pt-2 text-sm"
        >
          Tổng quan
        </TabsTrigger>
        <TabsTrigger
          value="timeline"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2.5 pt-2 text-sm"
        >
          Lộ trình
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2.5 pt-2 text-sm"
        >
          Lịch sử học
        </TabsTrigger>
        <TabsTrigger
          value="assets"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2.5 pt-2 text-sm"
        >
          Tài liệu
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <OverviewTab course={course} routines={routines} />
      </TabsContent>

      <TabsContent value="timeline" className="mt-6">
        <TimelineTab
          pendingTasks={pendingTasks}
          timelineEvents={timelineEvents}
        />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <HistoryTab completedTasks={completedTasks} />
      </TabsContent>

      <TabsContent value="assets" className="mt-6">
        <AssetsVaultTab assets={assets} courseId={course?.id!}/>
      </TabsContent>
    </Tabs>
  );
}

function OverviewTab({
  course,
  routines,
}: {
  course: ResponseCourseDto | null | undefined;
  routines: SimpleResponseRoutineDto[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin khóa học</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Tên khóa học
            </p>
            <p className="text-base font-semibold">{course?.name || "—"}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Mục tiêu
            </p>
            <p className="text-sm">{course?.goal || "Không có mục tiêu"}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Điểm mục tiêu
                </span>
              </div>
              <p className="text-2xl font-bold">{course?.targetScore ?? "—"}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Điểm hiện tại
                </span>
              </div>
              <p className="text-2xl font-bold text-muted-foreground">
                {course?.finalScore ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Lịch trình học tập</h3>
        {routines.length === 0 ? (
          <EmptyState text="Chưa có lịch trình" />
        ) : (
          <div className="space-y-3">
            {routines.map((routine) => (
              <Card key={routine.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        {routine.name}
                      </CardTitle>
                      {routine.instructor ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Giảng viên: {routine.instructor}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="secondary">{routine.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {routine.schedules?.length ? (
                    <div className="space-y-2">
                      {routine.schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Clock size={12} />
                          <span>
                            {weekdayMap[Number(schedule.dayOfWeek)] ||
                              `Thứ ${schedule.dayOfWeek}`}
                          </span>
                          <span>•</span>
                          <span>{schedule.startTime || "--:--"}</span>
                          {schedule.duration ? (
                            <>
                              <span>•</span>
                              <span>{schedule.duration} phút</span>
                            </>
                          ) : null}
                          {schedule.location ? (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={12} />
                                {schedule.location}
                              </span>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Chưa có lịch cố định.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineTab({
  pendingTasks,
  timelineEvents,
}: {
  pendingTasks: ResponseTaskDto[];
  timelineEvents: ResponseTimelineEventDto[];
}) {
  const items = useMemo(() => {
    const merged = [
      ...pendingTasks.map((task) => ({
        kind: "task" as const,
        id: String(task.id),
        date: task.taskDate || "",
        title: task.name || "Nhiệm vụ",
        detail: task.plannedDuration ? `${task.plannedDuration} phút` : "",
        priority: task.courseId ? undefined : undefined,
        type: task.type,
        isImportant: false,
      })),
      ...timelineEvents.map((event) => ({
        kind: "event" as const,
        id: String(event.id),
        date: event.dueDate || "",
        title: event.title || "Sự kiện",
        detail: event.priority ? `Ưu tiên ${event.priority}` : "",
        type: event.type,
        isImportant: event.type === "Exam" || event.type === "ProjectDeadline",
      })),
    ];

    return merged.sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      return aTime - bTime;
    });
  }, [pendingTasks, timelineEvents]);

  if (items.length === 0) {
    return <EmptyState text="Không có sự kiện sắp tới" />;
  }

  return (
    <ScrollArea className="h-160 pr-4">
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={`${item.kind}-${item.id}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border",
                  item.isImportant
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-primary/20 bg-primary/10 text-primary",
                )}
              >
                {item.kind === "task" ? (
                  <Clock size={16} />
                ) : (
                  <Calendar size={16} />
                )}
              </div>
              {index !== items.length - 1 ? (
                <div className="mt-2 h-full w-px bg-border" />
              ) : null}
            </div>
            <div className="flex-1 pb-6">
              <p className="text-xs text-muted-foreground">
                {item.date
                  ? new Date(item.date).toLocaleDateString("vi-VN")
                  : "—"}
              </p>
              <p className="mt-1 font-medium">{item.title}</p>
              {item.detail ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.detail}
                </p>
              ) : null}
              <Badge
                variant={item.isImportant ? "destructive" : "outline"}
                className="mt-2"
              >
                {item.kind === "task" ? `Task ${item.type || ""}` : item.type}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function HistoryTab({ completedTasks }: { completedTasks: ResponseTaskDto[] }) {
  const items = useMemo(() => {
    return [...completedTasks]
      .filter((task) => task.logs?.length)
      .sort((a, b) => {
        const aTime = a.logs?.[a.logs.length - 1]?.timerEndAt
          ? new Date(a.logs[a.logs.length - 1].timerEndAt || "").getTime()
          : 0;
        const bTime = b.logs?.[b.logs.length - 1]?.timerEndAt
          ? new Date(b.logs[b.logs.length - 1].timerEndAt || "").getTime()
          : 0;
        return bTime - aTime;
      });
  }, [completedTasks]);

  if (items.length === 0) {
    return <EmptyState text="Chưa có lịch sử học" />;
  }

  return (
    <div className="space-y-3">
      {items.map((task) => {
        const latestLog = task.logs?.[task.logs.length - 1];
        return (
          <Card key={task.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{task.name}</CardTitle>
                <Badge variant="outline">Đã hoàn thành</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>
                  Ngày hoàn thành:{" "}
                  {latestLog?.timerEndAt
                    ? new Date(latestLog.timerEndAt).toLocaleString("vi-VN")
                    : "—"}
                </span>
                <span>•</span>
                <span>Thời lượng: {latestLog?.actualDuration ?? "—"} phút</span>
                <span>•</span>
                <span>Mức độ khó: {latestLog?.difficultyLevel ?? "—"}</span>
              </div>

              {latestLog?.note ? (
                <div className="rounded-lg bg-muted/50 p-3 text-sm italic text-muted-foreground">
                  {latestLog.note}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AssetsVaultTab({ assets, courseId }: { assets: CourseAssetResponseDto[]
    , courseId: number
 }) {
  const generalAssets = assets.filter((asset) => asset.linkedType==="Course");
  const lessonAssets = assets.filter((asset) => asset.linkedType==="Task");

  return (
    <div className="space-y-6">
        <AssetUploader linkedId={courseId} linkedType="Course" />
      <AssetGroup title="Tài liệu chung" assets={generalAssets} />
      <AssetGroup title="Tài liệu từ các buổi học" assets={lessonAssets} />
    </div>
  );
}

function AssetGroup({
  title,
  assets,
}: {
  title: string;
  assets: CourseAssetResponseDto[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {assets.length === 0 ? (
        <EmptyState text={`Không có ${title.toLowerCase()}`} />
      ) : (
        <div className="space-y-2">
          {assets.map((asset) => (
            <AssetRow key={String(asset.id)} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetRow({ asset }: { asset: CourseAssetResponseDto }) {
  const config = getAssetIcon(asset.type, asset.url || asset.fileName || "");

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          config.bg,
        )}
      >
        <span className={config.color}>{config.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{asset.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {asset.createdAt
                ? new Date(asset.createdAt).toLocaleDateString("vi-VN")
                : "—"}
            </p>
          </div>
          <a
            href={asset.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Download"
          >
            <Download size={14} />
          </a>
        </div>
        {asset.sourceName ? (
          <Badge variant="secondary" className="mt-2">
            Đính kèm từ: {asset.sourceName}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

function getAssetIcon(type?: number | string, url?: string) {
  const extension = (url ?? "").split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return {
      icon: <ImageIcon size={16} />,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  }
  if (["pdf", "doc", "docx", "txt"].includes(extension)) {
    return {
      icon: <FileText size={16} />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    };
  }
  if (
    ["http", "https"].includes(extension) ||
    String(type).toLowerCase().includes("link")
  ) {
    return {
      icon: <LinkIcon size={16} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    };
  }
  return {
    icon: <FileText size={16} />,
    color: "text-slate-600",
    bg: "bg-slate-50",
  };
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
      <AlertCircle className="mb-2 h-8 w-8 opacity-40" />
      {text}
    </div>
  );
}
