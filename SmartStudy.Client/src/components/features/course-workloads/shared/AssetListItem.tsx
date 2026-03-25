import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssetResponseDto } from "@/services/api";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

interface AssetListItemProps {
  asset: AssetResponseDto;
}

export default function AssetListItem({ asset }: AssetListItemProps) {
  const config = getAssetIcon(asset.extension, asset.url, asset.type);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md",
          config.bg,
        )}
      >
        <span className={config.color}>{config.icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{asset.fileName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {asset.createdAt
              ? new Date(asset.createdAt).toLocaleDateString("vi-VN")
              : "--"}
          </p>
          <Badge variant="secondary" className="text-[10px]">
            {asset.linkedType}
          </Badge>
        </div>
      </div>

      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
        <a
          href={asset.url}
          target="_blank"
          rel="noreferrer"
          aria-label="Tải xuống tệp"
        >
          <Download size={14} />
        </a>
      </Button>
    </div>
  );
}

function getAssetIcon(
  extension?: string,
  url?: string,
  type?: number | string,
) {
  const normalizedExt = (
    extension ??
    url?.split(".").pop() ??
    ""
  ).toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(normalizedExt)) {
    return {
      icon: <ImageIcon size={16} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  }

  if (["pdf", "doc", "docx", "txt", "md"].includes(normalizedExt)) {
    return {
      icon: <FileText size={16} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    };
  }

  if (
    ["http", "https"].includes(normalizedExt) ||
    String(type).toLowerCase().includes("link")
  ) {
    return {
      icon: <LinkIcon size={16} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    };
  }

  return {
    icon: <FileText size={16} />,
    color: "text-slate-600",
    bg: "bg-slate-50",
  };
}
