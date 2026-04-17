import AssetItem from "@/components/files/AssetItem";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteAssetMutation,
  getCourseAssetQueryKey,
} from "@/services/api/@tanstack/react-query.gen";
import type { AssetLinkType, AssetResponseDto } from "@/services/api";
import { invalidateAssetContext } from "@/utils/query-invalidate";
import { useDialogStore } from "@/stores/useDialogStore";
import { useCourseContextStore } from "@/stores/useCourseContextStore";

interface AssetListItemProps {
  asset: AssetResponseDto;
  onPreview?: (asset: { url: string; fileName: string }) => void;
  linkedType: AssetLinkType;
  linkedId: number;
}

export default function AssetListItem({
  asset,
  onPreview,
  linkedType,
  linkedId,
}: AssetListItemProps) {
  const queryClient = useQueryClient();
  const { openDialog } = useDialogStore();
  const activeCourseId = useCourseContextStore((state) => state.activeCourseId);

  const unlinkAssetMutation = useMutation({
    ...deleteAssetMutation(),
    onSuccess: async () => {
      invalidateAssetContext(queryClient, linkedType, linkedId);

      if (activeCourseId && (linkedType === "Task" || linkedType === "Log")) {
        await queryClient.invalidateQueries({
          queryKey: getCourseAssetQueryKey({
            path: {
              courseId: activeCourseId,
            },
          }),
        });
      }

      toast.success("Đã gỡ liên kết tài liệu");
    },
    onError: () => {
      toast.error("Không thể gỡ liên kết tài liệu");
    },
  });

  const handleDelete = () => {
    const assetId = Number(asset.id);
    if (!Number.isFinite(assetId) || assetId <= 0) {
      toast.error("Không xác định được tài liệu để xóa");
      return;
    }

    openDialog("CONFIRM_DELETE", {
      itemName: asset.fileName ?? "tài liệu",
      itemType: "file",
      onConfirm: () => {
        unlinkAssetMutation.mutate({
          path: {
            assetId: String(assetId),
          },
          query: {
            linkedId,
            linkedType,
          },
        });
      },
    });
  };

  return (
    <AssetItem
      asset={asset}
      compact
      onPreview={onPreview}
      onDelete={() => handleDelete()}
    />
  );
}
