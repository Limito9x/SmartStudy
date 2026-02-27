import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";

interface UseBaseMutationProps<TData, TVariables> {
  queryKey?: string[]; // Key để invalidate
  successMessage?: string;
  errorMessage?: string;
  options?: UseMutationOptions<TData, Error, TVariables>;
}

export function useBaseMutation<TData, TVariables>(
  apiFn: (variables: TVariables) => Promise<TData>,
  {
    queryKey,
    successMessage,
    errorMessage,
    options,
  }: UseBaseMutationProps<TData, TVariables> = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiFn,
    onSuccess: (data, variables) => {
      // 1. Tự động làm tươi dữ liệu nếu có truyền queryKey
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }

      // 2. Hiện thông báo thành công
      if (successMessage) {
        console.log(successMessage); // Thay bằng toast hoặc component thông báo của bạn
      }
    },
    onError: (err, variables, context) => {
      // 4. Hiện thông báo lỗi mặc định hoặc từ backend
      console.error(errorMessage || err.message || "Có lỗi xảy ra!");
    },
    ...options,
  });
}