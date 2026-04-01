import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCourseWorkloadOptions } from "@/services/api/@tanstack/react-query.gen";
import type { CourseWorkloadDto } from "@/services/api";
import RoutineGroup from "@/components/features/course-workloads/components/RoutineGroup";
import CourseTaskCard from "@/components/features/course-workloads/components/CourseTaskCard";
import { useDialogStore } from "@/stores/useDialogStore";
import { useDebounce } from "@/hooks/useDebounce";

interface WorkloadsTabProps {
  courseId: number;
}

export default function WorkloadsTab({ courseId }: WorkloadsTabProps) {
  const { openDialog } = useDialogStore();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const workloadQuery = useQuery({
    ...getCourseWorkloadOptions({
      path: {
        courseId: courseId,
      },
      query: {
        search: debouncedSearch,
      },
    }),
    enabled: !!courseId,
  });
  const handleOpenCreateRoutine = () => {
    openDialog("ROUTINE_FORM", {
      courseId: courseId,
    });
  };

  const handleOpenCreateTask = () => {
    openDialog("TASK_FORM", {
      courseId: courseId,
    });
  };

  const data: CourseWorkloadDto | null = workloadQuery.data ?? null;
  const routines = data?.routines ?? [];
  const singleTasks = data?.singleTasks ?? [];
  const routineTaskCount = routines.reduce(
    (total, routine) => total + (routine.tasks?.length ?? 0),
    0,
  );
  const isEmpty = routines.length === 0 && singleTasks.length === 0;
  const isLoading = workloadQuery.isLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full space-y-3 md:w-auto">
          <h2 className="text-lg font-semibold">
            Danh sách Tiến độ & Công việc
          </h2>
          <Input
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-85"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
          <Button variant="outline" size="sm" onClick={handleOpenCreateRoutine}>
            <Plus size={14} />
            Thêm Lịch học
          </Button>
          <Button size="sm" onClick={handleOpenCreateTask}>
            <Plus size={14} />
            Tạo Công việc
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <AlertCircle className="mb-4 h-14 w-14 text-muted-foreground/60" />
          <p className="text-base font-semibold">Chưa có công việc nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bắt đầu bằng cách tạo công việc đầu tiên cho môn học này.
          </p>
          <Button className="mt-5" onClick={handleOpenCreateTask}>
            Tạo công việc đầu tiên
          </Button>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <SectionLabel
              title="Công việc theo lịch học"
              taskCount={routineTaskCount}
            />

            {routines.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
                Chưa có nhóm công việc theo lịch học.
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {routines.map((routine, index) => (
                  <RoutineGroup
                    key={String(routine.routine?.id ?? `routine-${index}`)}
                    routine={routine}
                    value={String(
                      routine.routine?.id ??
                        routine.routine?.name ??
                        `routine-${index}`,
                    )}
                  />
                ))}
              </Accordion>
            )}
          </section>

          <section className="space-y-3">
            <SectionLabel
              title="Công việc độc lập"
              taskCount={singleTasks.length}
            />

            {singleTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
                Chưa có công việc độc lập.
              </div>
            ) : (
              <div className="space-y-3">
                {singleTasks.map((task, index) => (
                  <CourseTaskCard
                    key={String(task?.id ?? `single-task-${index}`)}
                    taskData={task}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function SectionLabel({
  title,
  taskCount,
}: {
  title: string;
  taskCount: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h3>
      <div className="h-px flex-1 bg-border" />
      <Badge
        variant="outline"
        className="h-6 rounded-full px-2 text-xs font-medium text-muted-foreground"
      >
        {taskCount} {taskCount === 1 ? "task" : "tasks"}
      </Badge>
    </div>
  );
}
