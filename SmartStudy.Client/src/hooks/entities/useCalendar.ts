import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCalendarOptions,
  getInboxItemsOptions,
  rescheduleCalendarMutation,
  getCalendarQueryKey,
} from "@/services/api/@tanstack/react-query.gen";

export const useCalendar = ({ from, to }: { from: string; to: string }) => {
  const queryClient = useQueryClient();

  const getCalendar = () =>
    useQuery({
      ...getCalendarOptions({
        query: {
          fromDate: from,
          toDate: to,
        },
      }),
      enabled: !!from && !!to,
    });

  const getInboxItems = useQuery({
    ...getInboxItemsOptions(),
  });

  const rescheduleCalendar = useMutation({
    ...rescheduleCalendarMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getCalendarQueryKey({
          query: {
            fromDate: from,
            toDate: to,
          },
        }),
      });
    },
  });

  return {
    rescheduleCalendar,
    getCalendar,
    getInboxItems,
  };
};
