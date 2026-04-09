import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PreviewAsset } from "@/hooks/useAssetPreview";
import AssetViewer from "@/components/files/AssetViewer";

interface AssetPreviewDialogProps {
  asset: PreviewAsset | null;
  onClose: () => void;
}

export default function AssetPreviewDialog({
  asset,
  onClose,
}: AssetPreviewDialogProps) {
  return (
    <Dialog
      open={!!asset}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="truncate text-left text-base">
            {asset?.fileName}
          </DialogTitle>
        </DialogHeader>
        {asset ? (
          <AssetViewer url={asset.url} fileName={asset.fileName} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
