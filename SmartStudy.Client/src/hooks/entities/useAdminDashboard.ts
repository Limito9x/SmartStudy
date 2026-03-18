import { useQuery } from "@tanstack/react-query";
import {
  getKpiOptions,
  getKpiQueryKey,
  getUserGrowthOptions,
  getUserGrowthQueryKey,
  getBehaviorOptions,
  getBehaviorQueryKey,
} from "@/services/api/@tanstack/react-query.gen";

export const useGetKpi = () => {
  return useQuery({
    ...getKpiOptions(),
  });
};

export const useGetUserGrowth = () => {
  return useQuery({
    ...getUserGrowthOptions(),
  });
};

export const useGetBehavior = () => {
  return useQuery({
    ...getBehaviorOptions(),
  });
};
