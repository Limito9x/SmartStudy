import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubjectsOptions,
  getSubjectsQueryKey,
  bulkCreateSubjectsMutation,
  createSubjectMutation,
  updateSubjectMutation,
  deleteSubjectMutation,
} from "@/services/api/@tanstack/react-query.gen";

export const useSubject = () => {
  const queryClient = useQueryClient();

  const getSubjects = (pageIndex: number, pageSize: number, search?: string) =>
    useQuery({
      ...getSubjectsOptions({
        query: {
          PageIndex: pageIndex,
          PageSize: pageSize,
          SearchTerm: search,
        },
      }),
    });

  const createSubject = useMutation({
    ...createSubjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSubjectsQueryKey(),
      });
      alert("Tạo môn học thành công");
    },
  });

  const bulkCreateSubjects = useMutation({
    ...bulkCreateSubjectsMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSubjectsQueryKey(),
      });
      alert("Tạo môn học thành công");
    },
  });

  const updateSubject = useMutation({
    ...updateSubjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSubjectsQueryKey(),
      });
      alert("Cập nhật môn học thành công");
    },
  });

  const deleteSubject = useMutation({
    ...deleteSubjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSubjectsQueryKey(),
      });
      alert("Xóa môn học thành công");
    },
    onError: () => {
      alert("Có lỗi xảy ra khi xóa môn học");
    },
  });

  return {
    getSubjects,
    bulkCreateSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
};
