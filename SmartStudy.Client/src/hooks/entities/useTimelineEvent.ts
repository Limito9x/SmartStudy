import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPhasesOptions,
  getPhasesQueryKey,
  getPhaseByIdOptions,
  createPhaseMutation,
  updatePhaseMutation,
  deletePhaseMutation,
} from "@/services/api/@tanstack/react-query.gen";
import { invalidateCourseWorkloadContext } from "@/utils/query-invalidate";

export const useTimelineEvent = ({ courseId }: { courseId?: number }) => {
  const queryClient = useQueryClient();

  const getEventsByCourse = useQuery({
    ...getPhasesOptions({
      query: {
        courseId: courseId,
      },
    }),
    enabled: !!courseId,
  });

  const getEventById = (eventId: number) =>
    useQuery({
      ...getPhaseByIdOptions({
        path: {
          phaseId: eventId,
        },
      }),
      enabled: !!eventId,
    });

  const createEvent = useMutation({
    ...createPhaseMutation(),
    onSuccess: () => {
      invalidateCourseWorkloadContext(queryClient, Number(courseId));
      queryClient.invalidateQueries({
        queryKey: getPhasesQueryKey({
          query: {
            courseId: courseId,
          },
        }),
      });
    },
  });

  const updateEvent = useMutation({
    ...updatePhaseMutation(),
    onSuccess: () => {
      invalidateCourseWorkloadContext(queryClient, Number(courseId));
      queryClient.invalidateQueries({
        queryKey: getPhasesQueryKey({
          query: {
            courseId: courseId,
          },
        }),
      });
    },
  });

  const deleteEvent = useMutation({
    ...deletePhaseMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getPhasesQueryKey({
          query: {
            courseId: courseId,
          },
        }),
      });
    },
  });

  return {
    getEventsByCourse,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
