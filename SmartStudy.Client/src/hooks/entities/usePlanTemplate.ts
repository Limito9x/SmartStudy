import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import {
  clonePlanTemplateMutation,
  createPlanTemplateMutation,
  deletePlanTemplateMutation,
  importSelectedCoursesMutation,
  getMyPlanTemplatesOptions,
  getMyPlanTemplatesQueryKey,
  getPlanTemplateByIdOptions,
  getPlanTemplatesOptions,
  getPlanTemplatesQueryKey,
  updatePlanTemplateMutation,
} from "@/services/api/@tanstack/react-query.gen";
import { client } from "@/services/api/client.gen";
import type {
  CloneTemplateDto,
  CreatePlanTemplateDto,
  ImportSelectedCoursesDto,
  PlanTemplateDetailDto,
  UpdatePlanTemplateDto,
} from "@/services/api";
import { toast } from "sonner";

const getApiErrorMessage = (error: unknown): string | null => {
  if (!error || typeof error !== "object") {
    return null;
  }

  const errorWithResponse = error as {
    response?: {
      data?: {
        message?: string;
        title?: string;
        detail?: string;
      };
    };
    message?: string;
  };

  const apiMessage =
    errorWithResponse.response?.data?.message ||
    errorWithResponse.response?.data?.detail ||
    errorWithResponse.response?.data?.title;

  if (typeof apiMessage === "string" && apiMessage.trim() !== "") {
    return apiMessage;
  }

  if (
    typeof errorWithResponse.message === "string" &&
    errorWithResponse.message.trim() !== ""
  ) {
    return errorWithResponse.message;
  }

  return null;
};

interface GetPlanTemplatesParams {
  pageIndex?: number;
  pageSize?: number;
  searchTerm?: string;
  type?: "Academic" | "Personal";
}

export const useGetPlanTemplates = (params?: GetPlanTemplatesParams) => {
  const query = {
    PageIndex: params?.pageIndex,
    PageSize: params?.pageSize,
    SearchTerm: params?.searchTerm,
    ...(params?.type ? { Type: params.type } : {}),
  };

  return useQuery({
    ...getPlanTemplatesOptions({
      query: query as never,
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

const getPlanTemplatePreviewOptions = (sourcePlanId: number) =>
  queryOptions({
    queryKey: ["plan-template-preview", sourcePlanId],
    queryFn: async () => {
      const { data } = await client.get<
        { 200: PlanTemplateDetailDto },
        unknown,
        true
      >({
        url: "/api/templates/preview",
        query: {
          sourcePlanId,
        },
        throwOnError: true,
      });

      return data;
    },
    enabled: !!sourcePlanId,
  });

export const useGetPlanTemplatePreviewBySourcePlan = (sourcePlanId: number) => {
  return useQuery({
    ...getPlanTemplatePreviewOptions(sourcePlanId),
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
    onError: (error) => {
      const errorMessage =
        getApiErrorMessage(error) || "Không thể nhân bản template";
      toast.error(errorMessage);
    },
  });
};

export const useImportSelectedCourses = () => {
  const invalidateTemplateQueries = useInvalidateTemplateQueries();

  return useMutation({
    ...importSelectedCoursesMutation(),
    onSuccess: () => {
      invalidateTemplateQueries();
      toast.success("Import môn học thành công");
    },
    onError: (error) => {
      const errorMessage =
        getApiErrorMessage(error) || "Không thể import môn học";
      toast.error(errorMessage);
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
  const importSelectedCoursesMutation = useImportSelectedCourses();
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

  const importSelectedCourses = async (body: ImportSelectedCoursesDto) => {
    return importSelectedCoursesMutation.mutateAsync({ body });
  };

  return {
    getPlanTemplates,
    getMyPlanTemplates,
    createPlanTemplate,
    updatePlanTemplate,
    deletePlanTemplate,
    clonePlanTemplate,
    importSelectedCoursesMutation,
    createTemplate,
    updateTemplate,
    cloneTemplate,
    importSelectedCourses,
    togglePublish,
  };
};
