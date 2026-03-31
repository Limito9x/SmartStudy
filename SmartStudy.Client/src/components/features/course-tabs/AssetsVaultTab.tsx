import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CourseAssetResponseDto } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { getCourseAssetOptions } from "@/services/api/@tanstack/react-query.gen";
import AssetUploader from "@/components/files/AssetUploader";
import {
  AlertCircle,
  Download,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

interface AssetsVaultTabProps {
  courseId: number;
}

export default function AssetsVaultTab({ courseId }: AssetsVaultTabProps) {
  const assetsQuery = useQuery({
    ...getCourseAssetOptions({
      path: {
        courseId: courseId,
      },
    }),
    enabled: !!courseId,
  });

  const assets = assetsQuery.data ?? [];
  const isLoading = assetsQuery.isLoading;
  const generalAssets = assets.filter((asset) => asset.linkedType === "Course");
  const lessonAssets = assets.filter((asset) => asset.linkedType === "Task");

  return (
    <div className="space-y-6">
      <AssetUploader linkedId={courseId} linkedType="Course" />
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <AssetGroup title="Tài liệu chung" assets={generalAssets} />
          <AssetGroup title="Tài liệu từ các buổi học" assets={lessonAssets} />
        </>
      )}
    </div>
  );
}

function AssetGroup({
  title,
  assets,
}: {
  title: string;
  assets: CourseAssetResponseDto[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {assets.length === 0 ? (
        <EmptyState text={`Không có ${title.toLowerCase()}`} />
      ) : (
        <div className="space-y-2">
          {assets.map((asset) => (
            <AssetRow key={String(asset.id)} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetRow({ asset }: { asset: CourseAssetResponseDto }) {
  const config = getAssetIcon(asset.type, asset.url || asset.fileName || "");

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          config.bg,
        )}
      >
        <span className={config.color}>{config.icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{asset.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {asset.createdAt
                ? new Date(asset.createdAt).toLocaleDateString("vi-VN")
                : "—"}
            </p>
          </div>
          <a
            href={asset.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Tải xuống"
          >
            <Download size={14} />
          </a>
        </div>
        {asset.sourceName ? (
          <Badge variant="secondary" className="mt-2">
            Đính kèm từ: {asset.sourceName}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

function getAssetIcon(type?: number | string, url?: string) {
  const extension = (url ?? "").split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return {
      icon: <ImageIcon size={16} />,
      color: "text-green-600",
      bg: "bg-green-50",
    };
  }
  if (["pdf", "doc", "docx", "txt"].includes(extension)) {
    return {
      icon: <FileText size={16} />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    };
  }
  if (
    ["http", "https"].includes(extension) ||
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
      <AlertCircle className="mb-2 h-8 w-8 opacity-40" />
      {text}
    </div>
  );
}
