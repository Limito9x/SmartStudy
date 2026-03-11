import { useQuery } from "@tanstack/react-query";
import { getCalendarOptions } from "@/services/api/@tanstack/react-query.gen";

export const useCalendar = ({ from, to, studyPlanId }: { from: string; to: string, studyPlanId: number }) =>
  useQuery({
    ...getCalendarOptions({
      query: {
        fromDate: from,
        toDate: to,
        studyPlanId,
      },
    }),
    enabled: !!from && !!to && !!studyPlanId,
  });
