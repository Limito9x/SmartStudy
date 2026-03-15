import { useQuery } from "@tanstack/react-query";
import { getStudentDashboardSummaryOptions } from "@/services/api/@tanstack/react-query.gen";

export const useDashboard = () => {
  const getDashboardSummary = useQuery({
    ...getStudentDashboardSummaryOptions(),
  });

  return {
    getDashboardSummary,
  };
};
