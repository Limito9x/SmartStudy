import { Check, Clock3, NotebookPen, CalendarDays } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TaskType, TodayTaskDto } from "@/services/api";
import { formatTimeForTodayView } from "@/utils/dateUtils";

const taskTypeLabel: Record<TaskType, string> = {
  ClassSession: "Buổi học",
  SelfStudy: "Tự học",
  AssignmentWork: "Bài tập",
  Meeting: "Họp",
};

interface TodayTasksSectionProps {
  overdueTasks: TodayTaskDto[];
  todayTasks: TodayTaskDto[];
  completedTasks: TodayTaskDto[];
  onComplete: (task: TodayTaskDto) => void;
  onLogWork: (task: TodayTaskDto) => void;
  onReschedule: (task: TodayTaskDto, group: "overdue" | "today") => void;
  isCompleting: boolean;
  isRescheduling: boolean;
}

function formatTaskTime(time?: string | null) {
  if (!time) return "--:--";

  if (time.includes("T")) {
    const date = new Date(time);
    if (!Number.isNaN(date.getTime())) {
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
  }

  const [hour = "00", minute = "00"] = time.split(":");
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function TaskGroup({
  title,
  tasks,
  group,
  titleClassName,
  onComplete,
  onLogWork,
  onReschedule,
  isCompleting,
  isRescheduling,
}: {
  title: string;
  tasks: TodayTaskDto[];
  group: "overdue" | "today";
  titleClassName?: string;
  onComplete: (task: TodayTaskDto) => void;
  onLogWork: (task: TodayTaskDto) => void;
  onReschedule: (task: TodayTaskDto, group: "overdue" | "today") => void;
  isCompleting: boolean;
  isRescheduling: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <h3
          className={`text-xs font-semibold uppercase tracking-wide ${titleClassName ?? ""}`}
        >
          {title}
        </h3>
        <div className="h-px flex-1 bg-border" />
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-md border border-dashed px-3 py-3 text-xs text-muted-foreground">
          Không có dữ liệu.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task, index) => {
            const taskType = task.type;
            const badgeLabel = taskType ? taskTypeLabel[taskType] : "Khác";
            const isOverdue = group === "overdue";

            return (
              <div
                key={`${task.id ?? "task"}-${index}`}
                className="rounded-md border px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${isOverdue ? "text-rose-700" : "text-foreground"}`}
                    >
                      {task.name ?? "Chưa đặt tên"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge className="h-5 rounded-sm bg-lime-100 px-1.5 text-[11px] font-medium text-lime-700 hover:bg-lime-100">
                        {badgeLabel}
                      </Badge>
                      {task.courseName ? (
                        <Badge
                          variant="secondary"
                          className="h-5 rounded-sm px-1.5 text-[11px]"
                        >
                          {task.courseName}
                        </Badge>
                      ) : null}
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>{formatTimeForTodayView(task.startDateTime,task.endDateTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => onComplete(task)}
                    disabled={isCompleting}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Xong
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => onLogWork(task)}
                  >
                    <NotebookPen className="h-3.5 w-3.5" />
                    Ghi log
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => onReschedule(task, group)}
                    disabled={isRescheduling}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Dời
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TodayTasksSection({
  overdueTasks,
  todayTasks,
  completedTasks,
  onComplete,
  onLogWork,
  onReschedule,
  isCompleting,
  isRescheduling,
}: TodayTasksSectionProps) {
  const completedCount = completedTasks.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Công việc</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="rounded-sm bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 hover:bg-rose-100">
              {overdueTasks.length} quá hạn
            </Badge>
            <Badge className="rounded-sm bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100">
              {todayTasks.length} hôm nay
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TaskGroup
          title="Quá hạn"
          titleClassName="text-rose-600"
          tasks={overdueTasks}
          group="overdue"
          onComplete={onComplete}
          onLogWork={onLogWork}
          onReschedule={onReschedule}
          isCompleting={isCompleting}
          isRescheduling={isRescheduling}
        />

        <TaskGroup
          title="Hôm nay"
          tasks={todayTasks}
          group="today"
          onComplete={onComplete}
          onLogWork={onLogWork}
          onReschedule={onReschedule}
          isCompleting={isCompleting}
          isRescheduling={isRescheduling}
        />

        <Accordion type="single" collapsible>
          <AccordionItem value="completed" className="border rounded-md px-3">
            <AccordionTrigger className="py-3 text-sm font-medium text-muted-foreground hover:no-underline">
              <span>Đã hoàn thành hôm nay · {completedCount}</span>
            </AccordionTrigger>
            <AccordionContent>
              {completedCount === 0 ? (
                <div className="pb-1 text-xs text-muted-foreground">
                  Chưa có công việc hoàn thành.
                </div>
              ) : (
                <div className="space-y-2">
                  {completedTasks.map((task, index) => {
                    const badgeLabel = task.type
                      ? taskTypeLabel[task.type]
                      : "Khác";

                    return (
                      <div
                        key={`${task.id ?? "completed"}-${index}`}
                        className="rounded-md border bg-muted/40 px-3 py-2"
                      >
                        <p className="truncate text-sm font-medium text-muted-foreground line-through">
                          {task.name ?? "Chưa đặt tên"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge className="h-5 rounded-sm bg-lime-100 px-1.5 text-[11px] font-medium text-lime-700 hover:bg-lime-100">
                            {badgeLabel}
                          </Badge>
                          {task.courseName ? (
                            <Badge
                              variant="secondary"
                              className="h-5 rounded-sm px-1.5 text-[11px]"
                            >
                              {task.courseName}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
