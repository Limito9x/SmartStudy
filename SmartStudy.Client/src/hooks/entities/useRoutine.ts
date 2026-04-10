import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoutinesOptions,
  getRoutineByIdOptions,
  getRoutinesQueryKey,
  createRoutineMutation,
  updateRoutineMutation,
  deleteRoutineMutation,
  toggleRoutineStatusMutation,
  getRoutineByIdQueryKey,
} from "@/services/api/@tanstack/react-query.gen";
import type { TaskType } from "@/services/api";
import {
  invalidateCourseContext,
  invalidateCalendarContext,
} from "@/utils/query-invalidate";

export const useRoutine = () => {
  const queryClient = useQueryClient();

  const invalidateRoutines = () => {
    queryClient.invalidateQueries({
      queryKey: getRoutinesQueryKey(),
    });
    invalidateCalendarContext(queryClient);
  };

  const getAllRoutines = ({
    studyPlanId,
    courseId,
    type,
  }: {
    studyPlanId?: number;
    courseId?: number;
    type?: TaskType;
  }) =>
    useQuery({
      ...getRoutinesOptions({
        query: {
          StudyPlanId: studyPlanId,
          CourseId: courseId,
          Type: type,
        },
      }),
    });

  const getRoutineById = (id: number) =>
    useQuery({
      ...getRoutineByIdOptions({
        path: {
          id: id,
        },
      }),
      enabled: !!id,
    });

  const createRoutine = useMutation({
    ...createRoutineMutation(),
    onSuccess: (data) => {
      const courseId = data.courseId;
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });

      if (courseId) {
        invalidateCourseContext(queryClient, Number(courseId));
      }
    },
  });

  const updateRoutine = useMutation({
    ...updateRoutineMutation(),
    onSuccess: (data) => {
      const courseId = data.courseId;
      const routineId = data.id;
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      if (courseId) {
        invalidateCourseContext(queryClient, Number(courseId));
      }
      queryClient.invalidateQueries({
        queryKey: getRoutineByIdQueryKey({
          path: {
            id: Number(routineId),
          },
        }),
      });
    },
  });

  const toggleRoutineStatus = useMutation({
    ...toggleRoutineStatusMutation(),
    onSuccess: (data) => {
      const courseId = data.courseId;
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      if (courseId) {
        invalidateCourseContext(queryClient, Number(courseId));
      }
      queryClient.invalidateQueries({
        queryKey: getRoutineByIdQueryKey({
          path: {
            id: Number(data.id),
          },
        }),
      });
    },
  });

  const deleteRoutine = useMutation({
    ...deleteRoutineMutation(),
    onSuccess: () => {
      invalidateRoutines();
    },
  });

  return {
    getAllRoutines,
    getRoutineById,
    createRoutine,
    updateRoutine,
    toggleRoutineStatus,
    deleteRoutine,
  };
};
