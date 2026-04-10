import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTaskByIdOptions,
  getTasksOptions,
  getTasksQueryKey,
  getTaskDetailByIdOptions,
  createTaskMutation,
  createTaskLogWorkMutation,
  updateTaskInfoMutation,
  updateTaskStatusMutation,
  deleteTaskByIdMutation,
  getCourseWorkloadQueryKey,
  getTaskDetailByIdQueryKey,
  getCourseByIdQueryKey,
  getTaskByIdQueryKey,
} from "@/services/api/@tanstack/react-query.gen";
import type { TaskStatus } from "@/services/api";
import {
  invalidateCourseContext,
  invalidateCalendarContext,
} from "@/utils/query-invalidate";

export const useTask = () => {
  const queryClient = useQueryClient();

  const invalidateCourseRelatedQueries = (courseId: string | number | null) => {
    queryClient.invalidateQueries({
      queryKey: getCourseByIdQueryKey({
        path: {
          courseId: courseId ?? 0,
        },
      }),
    });
    queryClient.invalidateQueries({
      queryKey: getCourseWorkloadQueryKey({
        path: {
          courseId: courseId ?? 0,
        },
      }),
    });
  };

  const invalidateTaskRelatedQueries = (taskId: string | number) => {
    queryClient.invalidateQueries({
      queryKey: getTaskDetailByIdQueryKey({
        path: {
          taskId: taskId,
        },
      }),
    });
    queryClient.invalidateQueries({
      queryKey: getTaskByIdQueryKey({
        path: {
          taskId: taskId,
        },
      }),
    });
  };

  const getTasks = ({
    courseId,
    status,
  }: {
    courseId?: number;
    status?: TaskStatus;
  }) =>
    useQuery({
      ...getTasksOptions({
        query: {
          courseId,
          status,
        },
      }),
    });

  const getTaskById = (id: number) =>
    useQuery({
      ...getTaskByIdOptions({
        path: {
          taskId: id,
        },
      }),
      enabled: !!id,
    });

  const getTaskDetailById = (id: number) =>
    useQuery({
      ...getTaskDetailByIdOptions({
        path: {
          taskId: id,
        },
      }),
      meta: {
        hasAssets: true,
      },
      enabled: !!id,
    });

  const createTask = useMutation({
    ...createTaskMutation(),
    onSuccess: (data) => {
      const courseId = data.courseId;
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      if (courseId) {
        invalidateCourseContext(queryClient, Number(courseId));
      }
      invalidateCalendarContext(queryClient);
    },
  });

  const createTaskLogWork = useMutation({
    ...createTaskLogWorkMutation(),
    onSuccess: (data) => {
      const taskId = data.taskId;
      invalidateTaskRelatedQueries(taskId);
      invalidateCalendarContext(queryClient);
    },
  });

  const updateTaskInfo = useMutation({
    ...updateTaskInfoMutation(),
    onSuccess: (data) => {
      const taskId = data.id;
      invalidateTaskRelatedQueries(taskId);
      if (data.courseId) {
        invalidateCourseRelatedQueries(data.courseId);
      }
      invalidateCalendarContext(queryClient);
    },
  });

  const updateTaskStatus = useMutation({
    ...updateTaskStatusMutation(),
    onSuccess: (data) => {
      const taskId = data.id;
      const courseId = data.courseId;
      invalidateTaskRelatedQueries(taskId);
      if (courseId) {
        invalidateCourseContext(queryClient, Number(courseId));
      }
      invalidateCalendarContext(queryClient);
    },
  });

  const deleteTaskById = useMutation({
    ...deleteTaskByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      invalidateCalendarContext(queryClient);
    },
  });

  return {
    getTasks,
    getTaskById,
    getTaskDetailById,
    createTask,
    createTaskLogWork,
    updateTaskInfo,
    updateTaskStatus,
    deleteTaskById,
  };
};
