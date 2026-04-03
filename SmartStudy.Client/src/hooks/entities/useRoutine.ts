import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoutinesOptions,
  getRoutineByIdOptions,
  getRoutinesQueryKey,
  createRoutineMutation,
  updateRoutineMutation,
  getCalendarQueryKey,
  getInboxItemsQueryKey,
  deleteRoutineMutation,
  getCourseWorkloadQueryKey,
  toggleRoutineStatusMutation,
  getRoutineByIdQueryKey,
} from "@/services/api/@tanstack/react-query.gen";
import type { TaskType } from "@/services/api";

export const useRoutine = () => {
  const queryClient = useQueryClient();

  const invalidateRoutines = () => {
    queryClient.invalidateQueries({
      queryKey: getRoutinesQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getCalendarQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getInboxItemsQueryKey(),
    });
  };

  const invalidateCourseRoutines = (courseId: number) => {
    queryClient.invalidateQueries({
      queryKey: getCourseWorkloadQueryKey({
        path: {
          courseId: courseId,
        },
      }),
    });
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

      setTimeout(() => {
        invalidateRoutines();
        if (courseId) {
          invalidateCourseRoutines(Number(courseId));
        }
      }, 300);
    },
  });

  const updateRoutine = useMutation({
    ...updateRoutineMutation(),
    onSuccess: (data) => {
      const courseId = data.courseId;
      setTimeout(() => {
        invalidateRoutines();
        if (courseId) {
          invalidateCourseRoutines(Number(courseId));
        }
      }, 300);
    },
  });

  const toggleRoutineStatus = useMutation({
    ...toggleRoutineStatusMutation(),
    onSuccess: (data) => {
      const courseId = data.courseId;
      setTimeout(() => {
        invalidateRoutines();
        if (courseId) {
          invalidateCourseRoutines(Number(courseId));
        }
        queryClient.invalidateQueries({
          queryKey: getRoutineByIdQueryKey({
            path: {
              id: Number(data.id),
            },
          }),
        });
      }, 300);
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
