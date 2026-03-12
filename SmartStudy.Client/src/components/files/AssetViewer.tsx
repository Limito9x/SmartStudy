// components/ui/custom/AssetViewer.tsx
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssets, deleteAsset } from "@/services/api";
import type { AssetLinkType } from "@/services/api";

interface AssetViewerProps {
  linkedId: number;
  linkedType: AssetLinkType;
}

export default function AssetViewer({
  linkedId,
  linkedType,
}: AssetViewerProps) {
  const [previewAsset, setPreviewAsset] = useState<any>(null);

  const { data: assets } = useQuery({
    queryKey: ["assets", linkedId, linkedType],
    queryFn: () =>
      getAssets({ query: { linkedId, linkedType } }).then((r) => r.data),
  });

  const handleClick = (asset: any) => {
    if (["Image", "Video", "Audio", "Document", "Pdf"].includes(asset.type)) {
      setPreviewAsset(asset);
    } else {
      window.open(asset.url, "_blank");
    }
  };

  return (
    <>
      <div className="space-y-2">
        {assets?.map((asset) => (
          <AssetItem
            key={asset.id}
            asset={asset}
            onClick={() => handleClick(asset)}
          />
        ))}
      </div>

      <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-medium text-sm truncate">
              {previewAsset?.fileName}
            </p>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={previewAsset?.url} download>
                  <Download size={14} />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a
                  href={previewAsset?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={14} />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPreviewAsset(null)}
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          <div className="h-[70vh] overflow-hidden">
            <AssetPreview asset={previewAsset} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AssetPreview({ asset }: { asset: any }) {
  if (!asset) return null;

  if (asset.type === "Image") {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20 p-4">
        <img
          src={asset.url}
          alt={asset.fileName}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    );
  }

  if (asset.type === "Video") {
    return (
      <video controls className="w-full h-full bg-black">
        <source src={asset.url} />
      </video>
    );
  }

  if (asset.type === "Audio") {
    return (
      <div className="flex items-center justify-center h-full">
        <audio controls className="w-full max-w-md">
          <source src={asset.url} />
        </audio>
      </div>
    );
  }

  // PDF + Document → Google Docs Viewer
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(asset.url)}&embedded=true`;
  return (
    <iframe
      src={viewerUrl}
      className="w-full h-full border-0"
      title={asset.fileName}
    />
  );
}

// File type config
import { FileText, Image, Film, Music, Archive, File } from "lucide-react";

const fileConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  Image: {
    icon: <Image size={14} />,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  Video: { icon: <Film size={14} />, color: "text-blue-500", bg: "bg-blue-50" },
  Audio: {
    icon: <Music size={14} />,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  Document: {
    icon: <FileText size={14} />,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  Archive: {
    icon: <Archive size={14} />,
    color: "text-gray-500",
    bg: "bg-gray-50",
  },
  Other: { icon: <File size={14} />, color: "text-gray-400", bg: "bg-gray-50" },
};

function AssetItem({ asset, onClick }: { asset: any; onClick: () => void }) {
  const config = fileConfig[asset.type] ?? fileConfig.Other;
  const sizeKb = (asset.fileSize / 1024).toFixed(1);
  const queryClient = useQueryClient();

  const { mutate: remove } = useMutation({
    mutationFn: () => deleteAsset({ path: { assetId: String(asset.id) } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:bg-accent/50 transition-colors">
      {/* Click vùng này để preview */}
      <div
        onClick={onClick}
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
      >
        <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
          <span className={config.color}>{config.icon}</span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{asset.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {sizeKb} KB · {asset.extension}
          </p>
        </div>
      </div>

      {/* Nút xóa */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          remove();
        }}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
