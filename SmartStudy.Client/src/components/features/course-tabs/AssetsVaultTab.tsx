import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AssetPreviewDialog from "@/components/files/AssetPreviewDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssetPreview, type PreviewAsset } from "@/hooks/useAssetPreview";
import { cn } from "@/lib/utils";
import type { CourseAssetResponseDto } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { getCourseAssetOptions } from "@/services/api/@tanstack/react-query.gen";
import AssetUploader from "@/components/files/AssetUploader";
import { AlertCircle, Image as ImageIcon, Search } from "lucide-react";
import { useMemo, useState } from "react";
import AssetItem from "@/components/files/AssetItem";

interface AssetsVaultTabProps {
  courseId: number;
}

type AssetFilterType = "ALL" | "PDF" | "DOC_XLS" | "IMAGE";

const FILTER_OPTIONS: Array<{ value: AssetFilterType; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PDF", label: "PDF" },
  { value: "DOC_XLS", label: "DOCX/XLSX" },
  { value: "IMAGE", label: "Ảnh" },
];

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
const PDF_EXTENSIONS = ["pdf"];
const DOC_XLS_EXTENSIONS = ["doc", "docx", "xls", "xlsx"];

export default function AssetsVaultTab({ courseId }: AssetsVaultTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<AssetFilterType>("ALL");
  const { previewAsset, openPreview, closePreview } = useAssetPreview();

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

  const filteredAssets = useMemo(() => {
    const normalizedKeyword = searchTerm.trim().toLowerCase();

    return assets.filter((asset) => {
      const fileName = String(asset.fileName ?? "").toLowerCase();
      const extension = getFileExtension(asset.fileName, asset.url);

      const isMatchSearch =
        normalizedKeyword.length === 0 || fileName.includes(normalizedKeyword);

      const isMatchFilter = (() => {
        if (activeFilter === "ALL") {
          return true;
        }

        if (activeFilter === "PDF") {
          return PDF_EXTENSIONS.includes(extension);
        }

        if (activeFilter === "DOC_XLS") {
          return DOC_XLS_EXTENSIONS.includes(extension);
        }

        return IMAGE_EXTENSIONS.includes(extension);
      })();

      return isMatchSearch && isMatchFilter;
    });
  }, [assets, searchTerm, activeFilter]);

  const groupedAssets = useMemo(() => {
    return filteredAssets.reduce<Record<string, CourseAssetResponseDto[]>>(
      (acc, asset) => {
        const sourceName =
          asset.sourceName?.trim() && asset.sourceName.trim().length > 0
            ? asset.sourceName.trim()
            : "Nguồn khác";

        if (!acc[sourceName]) {
          acc[sourceName] = [];
        }

        acc[sourceName].push(asset);
        return acc;
      },
      {},
    );
  }, [filteredAssets]);

  const groupedEntries = useMemo(() => {
    return Object.entries(groupedAssets).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [groupedAssets]);

  return (
    <div className="space-y-6">
      <AssetUploader linkedId={courseId} linkedType="Course" />

      <div className="rounded-xl border bg-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tên tài liệu..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <Button
                  key={filter.value}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "h-8 rounded-full px-3 text-xs",
                    isActive && "shadow-sm",
                  )}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : groupedEntries.length === 0 ? (
        <EmptyState text="Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại." />
      ) : (
        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
          {groupedEntries.map(([sourceName, groupAssets]) => (
            <AssetGroup
              key={sourceName}
              title={sourceName}
              assets={groupAssets}
              onPreview={openPreview}
            />
          ))}
        </div>
      )}

      <AssetPreviewDialog asset={previewAsset} onClose={closePreview} />
    </div>
  );
}

function AssetGroup({
  title,
  assets,
  onPreview,
}: {
  title: string;
  assets: CourseAssetResponseDto[];
  onPreview: (asset: PreviewAsset) => void;
}) {
  const { imageAssets, documentAssets } = useMemo(() => {
    const split = {
      imageAssets: [] as CourseAssetResponseDto[],
      documentAssets: [] as CourseAssetResponseDto[],
    };

    assets.forEach((asset) => {
      const extension = getFileExtension(asset.fileName, asset.url);
      if (IMAGE_EXTENSIONS.includes(extension)) {
        split.imageAssets.push(asset);
      } else {
        split.documentAssets.push(asset);
      }
    });

    return split;
  }, [assets]);

  return (
    <div className="h-full rounded-xl border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {assets.length} tệp
        </Badge>
      </div>

      {assets.length === 0 ? (
        <EmptyState text="Không có tài liệu trong nhóm này." />
      ) : null}

      {documentAssets.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
          {documentAssets.map((asset) => (
            <AssetItem
              key={String(asset.id)}
              asset={asset}
              showSourceName={false}
              onPreview={onPreview}
            />
          ))}
        </div>
      ) : null}

      {imageAssets.length > 0 ? (
        <div className={cn("space-y-3", documentAssets.length > 0 && "mt-5")}>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Gallery ảnh
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2 justify-items-start">
            {imageAssets.map((asset) => (
              <button
                key={String(asset.id)}
                type="button"
                className="group relative aspect-square w-full max-w-44 overflow-hidden rounded-lg border bg-muted"
                onClick={() => {
                  if (asset.url && asset.fileName) {
                    onPreview({
                      url: asset.url,
                      fileName: asset.fileName,
                    });
                  }
                }}
                aria-label={`Xem ảnh ${asset.fileName}`}
              >
                {asset.url ? (
                  <img
                    src={asset.url}
                    alt={asset.fileName ?? "Ảnh tài liệu"}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon size={18} />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent p-2">
                  <p className="truncate text-[11px] text-white">
                    {asset.fileName || "Ảnh"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {documentAssets.length === 0 && imageAssets.length === 0 ? (
        <EmptyState text="Không có tệp hiển thị sau khi lọc." />
      ) : null}
    </div>
  );
}

function getFileExtension(fileName?: string, url?: string) {
  const source = fileName || url || "";
  return source.split(".").pop()?.toLowerCase() || "";
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
      <AlertCircle className="mb-2 h-8 w-8 opacity-40" />
      {text}
    </div>
  );
}
