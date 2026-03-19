import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clonePlanTemplateMutation,
  createPlanTemplateMutation,
  deletePlanTemplateMutation,
  getMyPlanTemplatesOptions,
  getMyPlanTemplatesQueryKey,
  getPlanTemplateByIdOptions,
  getPlanTemplatesOptions,
  getPlanTemplatesQueryKey,
  updatePlanTemplateMutation,
} from "@/services/api/@tanstack/react-query.gen";
import type {
  CloneTemplateDto,
  CreatePlanTemplateDto,
  UpdatePlanTemplateDto,
} from "@/services/api";
import { toast } from "sonner";

interface GetPlanTemplatesParams {
  pageIndex?: number;
  pageSize?: number;
  searchTerm?: string;
}

export const useGetPlanTemplates = (params?: GetPlanTemplatesParams) => {
  return useQuery({
    ...getPlanTemplatesOptions({
      query: {
        PageIndex: params?.pageIndex,
        PageSize: params?.pageSize,
        SearchTerm: params?.searchTerm,
      },
    }),
  });
};

export const useGetMyPlanTemplates = () => {
  return useQuery({
    ...getMyPlanTemplatesOptions(),
  });
};

export const useGetPlanTemplateById = (templateId: number) => {
  return useQuery({
    ...getPlanTemplateByIdOptions({
      path: {
        templateId,
      },
    }),
    enabled: !!templateId,
  });
};

const useInvalidateTemplateQueries = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: getPlanTemplatesQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getMyPlanTemplatesQueryKey(),
    });
  };
};

export const useCreatePlanTemplate = () => {
  const invalidateTemplateQueries = useInvalidateTemplateQueries();

  return useMutation({
    ...createPlanTemplateMutation(),
    onSuccess: () => {
      invalidateTemplateQueries();
      toast.success("Tạo template thành công");
    },
    onError: () => {
      toast.error("Không thể tạo template");
    },
  });
};

export const useUpdatePlanTemplate = () => {
  const invalidateTemplateQueries = useInvalidateTemplateQueries();

  return useMutation({
    ...updatePlanTemplateMutation(),
    onSuccess: () => {
      invalidateTemplateQueries();
      toast.success("Cập nhật template thành công");
    },
    onError: () => {
      toast.error("Không thể cập nhật template");
    },
  });
};

export const useDeletePlanTemplate = () => {
  const invalidateTemplateQueries = useInvalidateTemplateQueries();

  return useMutation({
    ...deletePlanTemplateMutation(),
    onSuccess: () => {
      invalidateTemplateQueries();
      toast.success("Xóa template thành công");
    },
    onError: () => {
      toast.error("Không thể xóa template");
    },
  });
};

export const useClonePlanTemplate = () => {
  const invalidateTemplateQueries = useInvalidateTemplateQueries();

  return useMutation({
    ...clonePlanTemplateMutation(),
    onSuccess: () => {
      invalidateTemplateQueries();
      toast.success("Nhân bản template thành công");
    },
    onError: () => {
      toast.error("Không thể nhân bản template");
    },
  });
};

export const useTogglePublishTemplate = () => {
  const updatePlanTemplate = useUpdatePlanTemplate();

  return async (
    templateId: number,
    body: Omit<UpdatePlanTemplateDto, "isPublic"> & { isPublic: boolean },
  ) => {
    return updatePlanTemplate.mutateAsync({
      path: { templateId },
      body: {
        ...body,
        isPublic: !body.isPublic,
      },
    });
  };
};

export const usePlanTemplate = (params?: GetPlanTemplatesParams) => {
  const getPlanTemplates = useGetPlanTemplates(params);
  const getMyPlanTemplates = useGetMyPlanTemplates();
  const createPlanTemplate = useCreatePlanTemplate();
  const updatePlanTemplate = useUpdatePlanTemplate();
  const deletePlanTemplate = useDeletePlanTemplate();
  const clonePlanTemplate = useClonePlanTemplate();
  const togglePublish = useTogglePublishTemplate();

  const createTemplate = async (body: CreatePlanTemplateDto) => {
    return createPlanTemplate.mutateAsync({ body });
  };

  const updateTemplate = async (
    templateId: number,
    body: UpdatePlanTemplateDto,
  ) => {
    return updatePlanTemplate.mutateAsync({
      path: { templateId },
      body,
    });
  };

  const cloneTemplate = async (body: CloneTemplateDto) => {
    return clonePlanTemplate.mutateAsync({ body });
  };

  return {
    getPlanTemplates,
    getMyPlanTemplates,
    createPlanTemplate,
    updatePlanTemplate,
    deletePlanTemplate,
    clonePlanTemplate,
    createTemplate,
    updateTemplate,
    cloneTemplate,
    togglePublish,
  };
};
