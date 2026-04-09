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
    type,
  }: {
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
          type: type,
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
    },
  });

  const bulkCreateSubjects = useMutation({
    ...bulkCreateSubjectsMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSubjectsQueryKey(),
      });
    },
  });

  const updateSubject = useMutation({
    ...updateSubjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSubjectsQueryKey(),
      });
    },
  });

  const deleteSubject = useMutation({
    ...deleteSubjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSubjectsQueryKey(),
      });
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
