import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudyPlansOptions,
  getStudyPlansQueryKey,
  getStudyPlanByIdOptions,
  createStudyPlanMutation,
  updateStudyPlanMutation,
  bulkCreateStudyPlansMutation,
  deleteStudyPlanMutation,
} from "@/services/api/@tanstack/react-query.gen";
import { toast } from "sonner";

export const useStudyPlan = () => {
  const queryClient = useQueryClient();

  const getAllStudyPlans = useQuery({
    ...getStudyPlansOptions(),
  });

  const getStudyPlanById = (id: number) => {
    return useQuery({
      ...getStudyPlanByIdOptions({
        path: { studyPlanId: id },
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

  const bulkCreateStudyPlans = useMutation({
    ...bulkCreateStudyPlansMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getStudyPlansQueryKey(),
      });
      toast.success("Tạo hàng loạt kế hoạch học tập thành công");
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
    getAllStudyPlans,
    getStudyPlanById,
    createStudyPlan,
    bulkCreateStudyPlans,
    updateStudyPlan,
    deleteStudyPlan,
  };
};
