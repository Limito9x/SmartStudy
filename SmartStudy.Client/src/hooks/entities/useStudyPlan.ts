import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudyPlansOptions,
  getStudyPlansQueryKey,
  getStudyPlanByIdOptions,
  createStudyPlanMutation,
  updateStudyPlanMutation,
  deleteStudyPlanMutation
} from "@/services/api/@tanstack/react-query.gen";


export const useStudyPlan = () => {
    const queryClient = useQueryClient();

    const getAllStudyPlans = useQuery({
        ...getStudyPlansOptions(),
    });

    const getStudyPlanById = (id: number) => {
        return useQuery({
            ...getStudyPlanByIdOptions({
                path: { studyPlanId: id },
            })
        });
    };

    const createStudyPlan = useMutation({
        ...createStudyPlanMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getStudyPlansQueryKey(),
            });
            alert("Tạo kế hoạch học tập thành công");
        }
    });

    const updateStudyPlan = useMutation({
        ...updateStudyPlanMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getStudyPlansQueryKey(),
            });
            alert("Cập nhật kế hoạch học tập thành công");
        }
    });

    const deleteStudyPlan = useMutation({
        ...deleteStudyPlanMutation(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getStudyPlansQueryKey(),
            });
            alert("Xóa kế hoạch học tập thành công");
        }
    });

    return {
        getAllStudyPlans,
        getStudyPlanById,
        createStudyPlan,
        updateStudyPlan,
        deleteStudyPlan
    };
}