import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubjectsOptions,
  getSubjectsQueryKey,
  getSubjectOptions,
  bulkCreateSubjectsMutation,
  createSubjectMutation,
  updateSubjectMutation,
  deleteSubjectMutation,
} from "@/services/api/@tanstack/react-query.gen";
import type { StudyPlanType } from "@/services/api";

export const useSubject = () => {
  const queryClient = useQueryClient();

  const getSubjects = ({
    pageIndex,
    pageSize,
    search,
    type
  }:{
    pageIndex: number;
    pageSize: number;
    search?: string;
    type?: StudyPlanType;
  }) =>
    useQuery({
      ...getSubjectsOptions({
        query: {
          PageIndex: pageIndex,
          PageSize: pageSize,
          SearchTerm: search,
          type: type
        },
      }),
    });

  const getSubjectById = (subjectId: number) =>
    useQuery({
      ...getSubjectOptions({
        path: { subjectId },
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
    getSubjectById,
    bulkCreateSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
};
