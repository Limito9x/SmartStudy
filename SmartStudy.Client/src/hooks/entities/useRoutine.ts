import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoutinesOptions,
  getRoutineByIdOptions,
  getRoutinesQueryKey,
  createRoutineMutation,
  updateRoutineMutation,
} from "@/services/api/@tanstack/react-query.gen";
import type { TaskType } from "@/services/api";

export const useRoutine = () => {
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      alert("Tạo thói quen thành công");
    },
  });

  const updateRoutine = useMutation({
    ...updateRoutineMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getRoutinesQueryKey(),
      });
      alert("Cập nhật thói quen thành công");
    },
  });

  return {
    getAllRoutines,
    getRoutineById,
    createRoutine,
    updateRoutine,
  };
};
