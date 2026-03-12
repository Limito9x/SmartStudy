import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventsByCourseOptions,
  getEventsByCourseQueryKey,
  createEventMutation,
  updateEventMutation,
  deleteEventMutation,
} from "@/services/api/@tanstack/react-query.gen";

export const useTimelineEvent = ({ courseId }: { courseId: number }) => {
  const queryClient = useQueryClient();

  const getEventsByCourse = useQuery({
    ...getEventsByCourseOptions({
      path: {
        courseId: courseId,
      },
    }),
  });

  const createEvent = useMutation({
    ...createEventMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getEventsByCourseQueryKey({
          path: {
            courseId: courseId,
          },
        }),
      });
    },
  });

  const updateEvent =
    useMutation({
      ...updateEventMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getEventsByCourseQueryKey({
            path: {
              courseId: courseId,
            },
          }),
        });
      },
    });

  const deleteEvent =
    useMutation({
      ...deleteEventMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getEventsByCourseQueryKey({
            path: {
              courseId: courseId,
            },
          }),
        });
      },
    });

  return {
    getEventsByCourse,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
