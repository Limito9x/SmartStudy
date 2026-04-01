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
  getTaskDetailByIdQueryKey
} from "@/services/api/@tanstack/react-query.gen";
import type { TaskStatus } from "@/services/api";

export const useTask = () => {
  const queryClient = useQueryClient();

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
        queryKey: getCourseWorkloadQueryKey({
          path: {
            courseId: courseId ?? 0,
          }
        }),
      });
    },
  });

  const createTaskLogWork = useMutation({
    ...createTaskLogWorkMutation(),
    onSuccess: (data) => {
      const taskId = data.taskId;
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getCalendarQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getStudentDashboardSummaryQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getTaskDetailByIdQueryKey({
          path: {
            taskId: taskId,
          }
        }),
      });
    },
  });

  const updateTaskInfo = useMutation({
    ...updateTaskInfoMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getCalendarQueryKey(),
      });
    },
  });

  const updateTaskStatus = useMutation({
    ...updateTaskStatusMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getCalendarQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getStudentDashboardSummaryQueryKey(),
      });
    },
  });

  const deleteTaskById = useMutation({
    ...deleteTaskByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getTasksQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getCalendarQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getStudentDashboardSummaryQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getInboxItemsQueryKey(),
      });
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
