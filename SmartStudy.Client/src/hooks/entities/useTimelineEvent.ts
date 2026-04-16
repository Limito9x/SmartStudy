import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPhasesOptions,
  getPhaseByIdOptions,
  createPhaseMutation,
  updatePhaseMutation,
  deletePhaseMutation,
} from "@/services/api/@tanstack/react-query.gen";
import { dispatchCourseContextInvalidation } from "@/utils/query-invalidate";

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
      dispatchCourseContextInvalidation(queryClient, {
        source: "Phase",
        courseId,
      });
    },
  });

  const updateEvent = useMutation({
    ...updatePhaseMutation(),
    onSuccess: () => {
      dispatchCourseContextInvalidation(queryClient, {
        source: "Phase",
        courseId,
      });
    },
  });

  const deleteEvent = useMutation({
    ...deletePhaseMutation(),
    onSuccess: () => {
      dispatchCourseContextInvalidation(queryClient, {
        source: "Phase",
        courseId,
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
