import { useQuery } from "@tanstack/react-query";
import { getStudentDashboardSummaryOptions, getStudentDashboardInsightOptions } from "@/services/api/@tanstack/react-query.gen";

export const useDashboard = () => {
  const getDashboardSummary = useQuery({
    ...getStudentDashboardSummaryOptions(),
  });

  // const getDashboardInsight = useQuery({
  //   ...getStudentDashboardInsightOptions(),
  //   enabled: !!getDashboardSummary.data,
  //   staleTime: 1000 * 60 * 30, // 30 minutes
  //   gcTime: 1000 * 60 * 60,
  // });

  return {
    getDashboardSummary,
  };
};
