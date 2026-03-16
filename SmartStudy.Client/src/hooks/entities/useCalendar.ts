import { useQuery } from "@tanstack/react-query";
import {
  getCalendarOptions,
  getUnscheduledItemsOptions,
} from "@/services/api/@tanstack/react-query.gen";

export const useCalendar = () => {
  const getCalendar = ({ from, to }: { from: string; to: string }) =>
    useQuery({
      ...getCalendarOptions({
        query: {
          fromDate: from,
          toDate: to,
        },
      }),
      enabled: !!from && !!to,
    });

  const getUnscheduledItems = useQuery({
    ...getUnscheduledItemsOptions(),
  });

  return {
    getCalendar,
    getUnscheduledItems,
  };
};
