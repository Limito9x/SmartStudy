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
  getCalendarQueryKey,
  getInboxItemsQueryKey,
  getStudentDashboardSummaryQueryKey,
  getCourseWorkloadQueryKey,
  getTaskDetailByIdQueryKey,
  getCourseByIdQueryKey,
  getTaskByIdQueryKey,
} from "@/services/api/@tanstack/react-query.gen";
import type { TaskStatus } from "@/services/api";

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

  const invalidateGeneralTaskQueries = () => {
    queryClient.invalidateQueries({
      queryKey: getTasksQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getCalendarQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getInboxItemsQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getStudentDashboardSummaryQueryKey(),
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
      enabled: !!id,
    });

  const createTask = useMutation({
    ...createTaskMutation(),
    onSuccess: (data) => {
      const courseId = data.courseId;
      invalidateGeneralTaskQueries();
      invalidateCourseRelatedQueries(courseId);
    },
  });

  const createTaskLogWork = useMutation({
    ...createTaskLogWorkMutation(),
    onSuccess: (data) => {
      const taskId = data.taskId;
      invalidateTaskRelatedQueries(taskId);
    },
  });

  const updateTaskInfo = useMutation({
    ...updateTaskInfoMutation(),
    onSuccess: (data) => {
      const taskId = data.id;
      invalidateGeneralTaskQueries();
      invalidateTaskRelatedQueries(taskId);
      invalidateCourseRelatedQueries(data.courseId);
    },
  });

  const updateTaskStatus = useMutation({
    ...updateTaskStatusMutation(),
    onSuccess: (data) => {
      const taskId = data.id;
      const courseId = data.courseId;
      invalidateGeneralTaskQueries();
      invalidateTaskRelatedQueries(taskId);
      invalidateCourseRelatedQueries(courseId);
    },
  });

  const deleteTaskById = useMutation({
    ...deleteTaskByIdMutation(),
    onSuccess: () => {
      invalidateGeneralTaskQueries();
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
    invalidateCourseRelatedQueries,
    invalidateTaskRelatedQueries,
  };
};
