import { useEffect } from "react";
import {
  HttpTransportType,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import {
  dispatchCourseContextInvalidation,
  updateAssetStatusInCache,
} from "@/utils/query-invalidate";

export const useSignalRNotifications = () => {
  const queryClient = useQueryClient();

  const { user } = useAuthStore();

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5037/notificationHub", {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on(
      "ReceiveNotification",
      (payload: { action: string; data: any; message: string }) => {
        console.log("Received SignalR notification:", payload);

        switch (payload.action) {
          case "ROUTINE_CLEARED":
            dispatchCourseContextInvalidation(queryClient, {
              source: "Routine",
              courseId: payload.data?.courseId,
              phaseId: payload.data?.phaseId,
            });
            break;
          case "ROUTINE_TASKS_UPDATED":
            dispatchCourseContextInvalidation(queryClient, {
              source: "Routine",
              courseId: payload.data?.courseId,
              phaseId: payload.data?.phaseId,
            });
            break;
          case "ASSET_RAG":
            if (
              payload.data?.assetId !== undefined &&
              payload.data?.assetId !== null &&
              payload.data?.status !== undefined &&
              payload.data?.status !== null
            ) {
              const assetId = Number(payload.data.assetId);
              if (!Number.isFinite(assetId)) {
                break;
              }

              updateAssetStatusInCache(
                queryClient,
                assetId,
                payload.data.status,
              );
            }
            break;
          default:
            console.warn("Unknown notification action:", payload.action);
        }

        if (payload.message) {
          toast.info(payload.message);
        }
      },
    );

    connection
      .start()
      .then(() => console.log("SignalR Connected!"))
      .catch((err) => console.error("SignalR Connection Error: ", err));

    // 4. Cleanup khi component unmount
    return () => {
      connection.stop();
    };
  }, [queryClient, user]);
};
