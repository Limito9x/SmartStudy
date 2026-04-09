import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudyPlansOptions,
  getStudyPlansQueryKey,
  getStudyPlanByIdOptions,
  getStudyPlanByIdQueryKey,
  createStudyPlanMutation,
  updateStudyPlanMutation,
  deleteStudyPlanMutation,
  getAcademicContextOptions,
  updateStudyPlanStatusMutation,
  getStudyPlanStatsOptions,
  getStudyPlanStatsQueryKey,
  getSummaryPlanProgressOptions,
} from "@/services/api/@tanstack/react-query.gen";
import { toast } from "sonner";

export const useStudyPlan = () => {
  const queryClient = useQueryClient();

  const getAcademicContext = useQuery({
    ...getAcademicContextOptions(),
  });

  const getSummaryPlanProgress = useQuery({
    ...getSummaryPlanProgressOptions(),
  });

  const getAllStudyPlans = (isActive?: boolean) =>
    useQuery({
      ...getStudyPlansOptions({
        query: { isActive },
      }),
    });

  const getStudyPlanById = (id: number) => {
    return useQuery({
      ...getStudyPlanByIdOptions({
        path: { studyPlanId: id },
      }),
      enabled: !!id, // Chỉ gọi API khi có ID
    });
  };

  const getStudyPlanStats = (id: number) => {
    return useQuery({
      ...getStudyPlanStatsOptions({
        path: { planId: id },
      }),
      enabled: !!id, // Chỉ gọi API khi có ID
    });
  };

  const createStudyPlan = useMutation({
    ...createStudyPlanMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getStudyPlansQueryKey(),
      });
      toast.success("Tạo kế hoạch học tập thành công");
    },
  });

  const updateStudyPlan = useMutation({
    ...updateStudyPlanMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getStudyPlansQueryKey(),
      });
      toast.success("Cập nhật kế hoạch học tập thành công");
    },
  });

  const updateStudyPlanStatus = useMutation({
    ...updateStudyPlanStatusMutation(),
    onSuccess: (_data, variables) => {
      const planId = Number(variables.path?.planId);

      queryClient.invalidateQueries({
        queryKey: getStudyPlansQueryKey(),
      });

      if (planId) {
        queryClient.invalidateQueries({
          queryKey: getStudyPlanByIdQueryKey({
            path: { studyPlanId: planId },
          }),
        });
        queryClient.invalidateQueries({
          queryKey: getStudyPlanStatsQueryKey({
            path: { planId },
          }),
        });
      }

      toast.success("Cập nhật trạng thái kế hoạch học tập thành công");
    },
  });

  const deleteStudyPlan = useMutation({
    ...deleteStudyPlanMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getStudyPlansQueryKey(),
      });
      toast.success("Xóa kế hoạch học tập thành công");
    },
  });

  return {
    getAcademicContext,
    getSummaryPlanProgress,
    getAllStudyPlans,
    getStudyPlanById,
    getStudyPlanStats,
    updateStudyPlanStatus,
    createStudyPlan,
    updateStudyPlan,
    deleteStudyPlan,
  };
};
