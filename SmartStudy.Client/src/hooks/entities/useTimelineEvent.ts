import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventsOptions,
  getEventsQueryKey,
  getEventByIdOptions,
  createEventMutation,
  updateEventMutation,
  deleteEventMutation,
} from "@/services/api/@tanstack/react-query.gen";

export const useTimelineEvent = ({ courseId }: { courseId?: number }) => {
  const queryClient = useQueryClient();

  const getEventsByCourse = useQuery({
    ...getEventsOptions({
      query: {
        courseId: courseId,
      }
    }),
    enabled: !!courseId,
  });

  const getEventById = (eventId: number) =>
    useQuery({
      ...getEventByIdOptions({
        path: {
          eventId: eventId,
        },
      }),
      enabled: !!eventId,
    });

  const createEvent = useMutation({
    ...createEventMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getEventsQueryKey({
          query: {
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
          queryKey: getEventsQueryKey({
            query: {
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
          queryKey: getEventsQueryKey({
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
