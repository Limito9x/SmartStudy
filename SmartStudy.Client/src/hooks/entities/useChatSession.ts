import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChatSessionByIdOptions,
  getAllChatSessionsOptions,
  createChatSessionMutation,
} from "@/services/api/@tanstack/react-query.gen";

export const useChatSession = () => {
  const queryClient = useQueryClient();

  const getAllChatSessions = useQuery({
    ...getAllChatSessionsOptions(),
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
        queryKey: getAllChatSessionsOptions().queryKey,
      });
    },
  });

  return {
    getAllChatSessions,
    getChatSessionById,
    createChatSession,
  };
};
