import { type QueryClient } from "@tanstack/react-query";
import {
  getCourseByIdQueryKey,
  getCourseWorkloadQueryKey,
  getCalendarQueryKey,
  getInboxItemsQueryKey,
  getTaskDetailByIdQueryKey,
  getCourseAssetQueryKey,
} from "@/services/api/@tanstack/react-query.gen";
import type {
  AssetStatus,
  AssetLinkType,
  CourseAssetResponseDto,
  CourseWorkloadDto,
  TaskDetailDto,
} from "@/services/api";

type QueryKeyRoot = {
  _id?: string;
  path?: {
    courseId?: number | string;
  };
};

const QUERY_KEY_ID = {
  taskDetailById: "getTaskDetailById",
  courseAsset: "getCourseAsset",
  courseWorkload: "getCourseWorkload",
} as const;

export const invalidateCourseContext = (
  queryClient: QueryClient,
  courseId: number,
) => {
  queryClient.invalidateQueries({
    queryKey: getCourseByIdQueryKey({
      path: {
        courseId: courseId,
      },
    }),
  });
  invalidateCourseWorkloadContext(queryClient, courseId);
  queryClient.invalidateQueries({
    queryKey: getCourseAssetQueryKey({
      path: {
        courseId: courseId,
      },
    }),
  });
};

export const invalidateCalendarContext = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({
    queryKey: getCalendarQueryKey(),
  });
  queryClient.invalidateQueries({
    queryKey: getInboxItemsQueryKey(),
  });
};

export const updateAssetStatusInCache = (
  queryClient: QueryClient,
  assetId: number,
  newStatus: number | string,
) => {
  const normalizedAssetId = Number(assetId);
  const normalizedStatus = normalizeAssetStatus(newStatus);

  if (!Number.isFinite(normalizedAssetId) || normalizedStatus === null) {
    return;
  }

  queryClient.setQueriesData(
    {
      predicate: (query) => {
        const root = query.queryKey[0] as QueryKeyRoot | undefined;
        return root?._id === QUERY_KEY_ID.taskDetailById;
      },
    },
    (oldData: TaskDetailDto | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        docs: oldData.docs?.map((a) =>
          Number(a.id) === normalizedAssetId
            ? { ...a, status: normalizedStatus }
            : a,
        ),
        logs: oldData.logs?.map((logDoc) => ({
          ...logDoc,
          assets: logDoc.assets?.map((a) =>
            Number(a.id) === normalizedAssetId
              ? { ...a, status: normalizedStatus }
              : a,
          ),
        })),
      };
    },
  );

  queryClient.setQueriesData(
    {
      predicate: (query) => {
        const root = query.queryKey[0] as QueryKeyRoot | undefined;
        return root?._id === QUERY_KEY_ID.courseAsset;
      },
    },
    (oldData: CourseAssetResponseDto[] | undefined) => {
      if (!Array.isArray(oldData)) {
        return oldData;
      }

      return oldData.map((asset) =>
        Number(asset.id) === normalizedAssetId
          ? { ...asset, status: normalizedStatus }
          : asset,
      );
    },
  );
};

const normalizeAssetStatus = (status: number | string): AssetStatus | null => {
  if (typeof status === "number" && Number.isFinite(status)) {
    if (status === 0) return "Uploaded";
    if (status === 1) return "Processing";
    if (status === 2) return "Analyzed";
    if (status === 3) return "Failed";
    return null;
  }

  if (typeof status === "string") {
    const normalized = status.trim().toLowerCase();
    if (normalized === "uploaded") return "Uploaded";
    if (normalized === "processing") return "Processing";
    if (normalized === "analyzed") return "Analyzed";
    if (normalized === "failed") return "Failed";

    const asNumber = Number(status);
    return normalizeAssetStatus(asNumber);
  }

  return null;
};

export const invalidateAssetContext = (
  queryClient: QueryClient,
  linkedType: AssetLinkType,
  linkedId: number,
) => {
  if (!Number.isFinite(linkedId) || linkedId <= 0) {
    return;
  }

  if (linkedType === "Task") {
    queryClient.invalidateQueries({
      queryKey: getTaskDetailByIdQueryKey({
        path: {
          taskId: linkedId,
        },
      }),
    });
  }

  if (linkedType === "Course") {
    queryClient.invalidateQueries({
      queryKey: getCourseAssetQueryKey({
        path: {
          courseId: linkedId,
        },
      }),
    });
    return;
  }

  if (linkedType === "Task" || linkedType === "Log") {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const root = query.queryKey[0] as QueryKeyRoot | undefined;
        return root?._id === QUERY_KEY_ID.courseAsset;
      },
    });
  }

  if (linkedType === "Log") {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const root = query.queryKey[0] as QueryKeyRoot | undefined;
        return root?._id === QUERY_KEY_ID.taskDetailById;
      },
    });
  }
};

export const invalidateCourseWorkloadContext = (
  queryClient: QueryClient,
  courseId?: number,
) => {
  if (Number.isFinite(courseId) && Number(courseId) > 0) {
    queryClient.invalidateQueries({
      queryKey: getCourseWorkloadQueryKey({
        path: {
          courseId: Number(courseId),
        },
      }),
    });
    return;
  }

  queryClient.invalidateQueries({
    predicate: (query) => {
      const root = query.queryKey[0] as QueryKeyRoot | undefined;
      return root?._id === QUERY_KEY_ID.courseWorkload;
    },
  });
};

export const invalidateRoutineInCourseWorkloadCache = (
  queryClient: QueryClient,
  courseId?: number,
  _routineId?: number,
) => {
  // The routine payload is not included in SignalR event, so we trigger a targeted refetch.
  invalidateCourseWorkloadContext(queryClient, courseId);

  queryClient.setQueriesData(
    {
      predicate: (query) => {
        const root = query.queryKey[0] as QueryKeyRoot | undefined;
        if (root?._id !== QUERY_KEY_ID.courseWorkload) {
          return false;
        }

        if (!Number.isFinite(courseId) || Number(courseId) <= 0) {
          return true;
        }

        return Number(root.path?.courseId) === Number(courseId);
      },
    },
    (oldData: CourseWorkloadDto | undefined) => oldData,
  );
};
