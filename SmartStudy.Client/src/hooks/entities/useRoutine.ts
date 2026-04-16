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
    phaseId,
    type,
  }: {
    studyPlanId?: number;
    phaseId?: number;
    type?: TaskType;
  }) =>
    useQuery({
      ...getRoutinesOptions({
        query: {
          StudyPlanId: studyPlanId,
          phaseId,
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      invalidateCalendarContext(queryClient);
    },
  });

  const updateRoutine = useMutation({
    ...updateRoutineMutation(),
    onSuccess: (data) => {
      const routineId = data.id;
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      invalidateCalendarContext(queryClient);
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
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      invalidateCalendarContext(queryClient);
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
