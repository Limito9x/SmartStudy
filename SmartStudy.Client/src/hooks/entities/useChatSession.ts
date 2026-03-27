import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChatSessionByIdOptions,
  getAllChatSessionsOptions,
  getAllChatSessionsQueryKey,
  createChatSessionMutation,
} from "@/services/api/@tanstack/react-query.gen";

export const useChatSession = () => {
  const queryClient = useQueryClient();

  const getAllChatSessions = (courseId?: number) => useQuery({
    ...getAllChatSessionsOptions({
      query: {
        courseId
      }
    }),
  });

  const getChatSessionById = (id: number) =>
    useQuery({
      ...getChatSessionByIdOptions({
        path: { sessionId: id },
      }),
      enabled: !!id,
    });

  const createChatSession = useMutation({
    ...createChatSessionMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getAllChatSessionsQueryKey(),
      });
    },
  });

  return {
    getAllChatSessions,
    getChatSessionById,
    createChatSession,
  };
};
