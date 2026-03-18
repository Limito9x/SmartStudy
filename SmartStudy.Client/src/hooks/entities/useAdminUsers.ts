import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsersOptions,
  getUsersQueryKey,
  toggleUserStatusMutation
} from "@/services/api/@tanstack/react-query.gen";
import { toast } from "sonner";

interface UseGetAdminUsersParams {
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
}

export const useGetAdminUsers = ({
  pageIndex,
  pageSize,
  searchTerm,
}: UseGetAdminUsersParams) => {
  return useQuery({
    ...getUsersOptions({
      query: {
        pageIndex: pageIndex,
        pageSize: pageSize,
      },
    }),
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...toggleUserStatusMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUsersQueryKey(),
      });
      toast.success("Cập nhật trạng thái người dùng thành công");
    },
    onError: () => {
      toast.error("Lỗi khi cập nhật trạng thái người dùng");
    },
  });
};
