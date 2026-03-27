import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";
import type { CourseWorkloadDto } from "@/services/api";
import RoutineGroup from "@/components/features/course-workloads/components/RoutineGroup";
import CourseTaskCard from "@/components/features/course-workloads/components/CourseTaskCard";
import { useDialogStore } from "@/stores/useDialogStore";

interface WorkloadsTabProps {
  courseId?: number;
  data: CourseWorkloadDto | null | undefined;
}

export default function WorkloadsTab({ courseId, data }: WorkloadsTabProps) {
  const { openDialog } = useDialogStore();
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
  const routines = data?.routines ?? [];
  const singleTasks = data?.singleTasks ?? [];

  const isEmpty = routines.length === 0 && singleTasks.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Danh sách Tiến độ & Công việc</h2>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleOpenCreateRoutine();
            }}
          >
            <Plus size={14} />
            Thêm Lịch học
          </Button>
          <Button
            size="sm"
            onClick={() => {
              handleOpenCreateTask();
            }}
          >
            <Plus size={14} />
            Tạo Công việc
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <AlertCircle className="mb-4 h-14 w-14 text-muted-foreground/60" />
          <p className="text-base font-semibold">Chưa có công việc nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bắt đầu bằng cách tạo công việc đầu tiên cho môn học này.
          </p>
          <Button
            className="mt-5"
            onClick={() => handleOpenCreateTask()}
          >
            Tạo công việc đầu tiên
          </Button>
        </div>
      ) : null}

      {!isEmpty ? (
        <>
          <section className="space-y-4">
            <div className="rounded-xl border-l-4 border-primary bg-primary/5 px-4 py-3">
              <h3 className="text-sm font-semibold">Công việc theo lịch học</h3>
              <p className="text-xs text-muted-foreground">
                Các công việc được nhóm theo từng routine để theo dõi tiến độ rõ
                ràng.
              </p>
            </div>

            {routines.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
                Chưa có nhóm công việc theo lịch học.
              </div>
            ) : (
              <div className="space-y-4">
                {routines.map((routine, index) => (
                  <RoutineGroup
                    key={String(routine.routine?.id ?? `routine-${index}`)}
                    routine={routine}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="rounded-xl border-l-4 border-orange-500 bg-orange-50/80 px-4 py-3">
              <h3 className="text-sm font-semibold text-orange-900">
                Công việc độc lập
              </h3>
              <p className="text-xs text-orange-700">
                Các công việc không thuộc bất kỳ routine cố định nào.
              </p>
            </div>

            {singleTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
                Chưa có công việc độc lập.
              </div>
            ) : (
              <div className="space-y-3">
                {singleTasks.map((task, index) => (
                  <CourseTaskCard
                    key={String(task.task?.id ?? `single-task-${index}`)}
                    taskData={task}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
