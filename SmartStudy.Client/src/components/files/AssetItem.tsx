import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AssetItemData {
  id?: number | string;
  fileName?: string;
  url?: string;
  createdAt?: string;
  extension?: string;
  type?: number | string;
  linkedType?: string;
  sourceName?: string;
  status?: string;
}

interface AssetItemProps {
  asset: AssetItemData;
  showSourceName?: boolean;
  compact?: boolean;
  onPreview?: (asset: { url: string; fileName: string }) => void;
  onDelete?: (asset: AssetItemData) => void;
}

export default function AssetItem({
  asset,
  showSourceName = false,
  compact = false,
  onPreview,
  onDelete,
}: AssetItemProps) {
  const fileName = asset.fileName || "Tệp đính kèm";
  const fileUrl = asset.url;
  const config = getAssetIcon(
    asset.extension,
    asset.url,
    asset.type,
    asset.linkedType,
  );
  const statusConfig = getAssetStatusConfig(asset.status);

  const handlePreview = () => {
    if (onPreview && fileUrl) {
      onPreview({
        url: fileUrl,
        fileName,
      });
      return;
    }

    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={cn(
        "@container/asset flex items-center gap-3 rounded-xl border bg-card",
        compact ? "p-3" : "p-3.5",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg",
          compact ? "h-9 w-9" : "h-10 w-10",
          config.bg,
        )}
      >
        <span className={config.color}>{config.icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{fileName}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {asset.createdAt
                  ? new Date(asset.createdAt).toLocaleDateString("vi-VN")
                  : "--"}
              </span>
              {statusConfig ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 gap-1 px-2 text-[11px]",
                    statusConfig.className,
                  )}
                >
                  <statusConfig.icon
                    className={cn("h-3.5 w-3.5", statusConfig.animateClass)}
                  />
                  <span>{statusConfig.label}</span>
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-0.5 @sm/asset:gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={handlePreview}
                    disabled={!fileUrl}
                    aria-label="Xem trước"
                  >
                    <Eye size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Xem trước</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label="Thao tác khác"
                >
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild disabled={!fileUrl}>
                  <a href={fileUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} />
                    Mở trang khác
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild disabled={!fileUrl}>
                  <a href={fileUrl} target="_blank" rel="noreferrer" download>
                    <Download size={14} />
                    Tải xuống
                  </a>
                </DropdownMenuItem>
                {onDelete && asset.id !== undefined && asset.id !== null ? (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(asset)}
                  >
                    <Trash2 size={14} />
                    Xóa
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showSourceName && asset.sourceName ? (
          <Badge variant="secondary" className="mt-2 text-[11px]">
            {asset.sourceName}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

function getAssetStatusConfig(status?: string) {
  switch (status) {
    case "Processing":
      return {
        label: "Đang xử lý",
        icon: Loader2,
        animateClass: "animate-spin",
        className: "bg-blue-50 text-blue-700",
      };
    case "Analyzed":
      return {
        label: "Đã phân tích",
        icon: CheckCircle2,
        animateClass: "",
        className: "bg-emerald-50 text-emerald-700",
      };
    case "Failed":
      return {
        label: "Xử lý lỗi",
        icon: AlertTriangle,
        animateClass: "",
        className: "bg-rose-50 text-rose-700",
      };
    default:
      return null;
  }
}

function getAssetIcon(
  extension?: string,
  url?: string,
  type?: number | string,
  linkedType?: string,
) {
  const normalizedExt = (
    extension ??
    url?.split(".").pop() ??
    ""
  ).toLowerCase();

  const normalizedLinkedType = String(linkedType ?? "").toLowerCase();
  const isExternalLink = normalizedLinkedType === "externallink";

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(normalizedExt)) {
    return {
      icon: <ImageIcon size={16} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  }

  if (
    ["pdf", "doc", "docx", "txt", "md", "xls", "xlsx"].includes(normalizedExt)
  ) {
    return {
      icon: <FileText size={16} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    };
  }

  if (
    isExternalLink ||
    ["http", "https"].includes(normalizedExt) ||
    url?.startsWith("http://") ||
    url?.startsWith("https://") ||
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
