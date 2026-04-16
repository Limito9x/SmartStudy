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
import { dispatchCourseContextInvalidation } from "@/utils/query-invalidate";

export const useRoutine = () => {
  const queryClient = useQueryClient();

  const invalidateRoutines = () => {
    dispatchCourseContextInvalidation(queryClient, {
      source: "Routine",
    });
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
    onSuccess: (_data, variables) => {
      dispatchCourseContextInvalidation(queryClient, {
        source: "Routine",
        phaseId: variables.body?.phaseId,
      });
    },
  });

  const updateRoutine = useMutation({
    ...updateRoutineMutation(),
    onSuccess: (data, variables) => {
      const routineId = data.id;
      dispatchCourseContextInvalidation(queryClient, {
        source: "Routine",
        phaseId: variables.body?.phaseId,
      });
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
      dispatchCourseContextInvalidation(queryClient, {
        source: "Routine",
      });
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
