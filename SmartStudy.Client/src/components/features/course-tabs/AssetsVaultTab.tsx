import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AssetPreviewDialog from "@/components/files/AssetPreviewDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssetPreview, type PreviewAsset } from "@/hooks/useAssetPreview";
import { cn } from "@/lib/utils";
import type { CourseAssetResponseDto } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { getCourseAssetOptions } from "@/services/api/@tanstack/react-query.gen";
import {
  deleteAssetMutation,
  getCourseAssetQueryKey,
  uploadAssetLinkMutation,
} from "@/services/api/@tanstack/react-query.gen";
import AssetUploader from "@/components/files/AssetUploader";
import {
  AlertCircle,
  ChevronDown,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AssetItem from "@/components/files/AssetItem";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDialogStore } from "@/stores/useDialogStore";
import { usePanelStore } from "@/stores/usePanelStore";

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
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDisplayName, setLinkDisplayName] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
  const { previewAsset, openPreview, closePreview } = useAssetPreview();
  const { openPanel, isOpen, type } = usePanelStore();
  const queryClient = useQueryClient();

  const deleteAssetMutator = useMutation({
    ...deleteAssetMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getCourseAssetQueryKey({
          path: {
            courseId,
          },
        }),
      });
      toast.success("Đã xóa tài liệu");
    },
    onError: () => {
      toast.error("Không thể xóa tài liệu");
    },
  });

  const { openDialog } = useDialogStore();

  const uploadLinkMutation = useMutation({
    ...uploadAssetLinkMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getCourseAssetQueryKey({
          path: {
            courseId,
          },
        }),
      });
      toast.success("Đã thêm tài liệu từ liên kết");
      setIsLinkDialogOpen(false);
      setLinkUrl("");
      setLinkDisplayName("");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Không thể thêm liên kết";
      toast.error(message);
    },
  });

  const handleDeleteAsset = (asset: CourseAssetResponseDto) => {
    const assetId = Number(asset.id);
    const linkedIdFromAsset = Number(
      (asset as CourseAssetResponseDto & { linkedId?: number | string })
        .linkedId,
    );
    const linkedId =
      Number.isFinite(linkedIdFromAsset) && linkedIdFromAsset > 0
        ? linkedIdFromAsset
        : courseId;
    const linkedType = asset.linkedType ?? "Course";

    openDialog("CONFIRM_DELETE", {
      itemName: asset.fileName ?? "tài liệu",
      itemType: "file",
      onConfirm: () => {
        deleteAssetMutator.mutate({
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

  const selectableAssetIdSet = useMemo(() => {
    return new Set(
      assets
        .filter(isAssetSelectableForChat)
        .map((asset) => getNumericAssetId(asset))
        .filter((id): id is number => id !== null),
    );
  }, [assets]);

  const selectableFilteredAssetIds = useMemo(() => {
    return filteredAssets
      .filter(isAssetSelectableForChat)
      .map((asset) => getNumericAssetId(asset))
      .filter((id): id is number => id !== null);
  }, [filteredAssets]);

  useEffect(() => {
    setSelectedAssetIds((prev) =>
      prev.filter((id) => selectableAssetIdSet.has(id)),
    );
  }, [selectableAssetIdSet]);

  const scopedSelectedAssetIds = useMemo(
    () => selectedAssetIds.filter((id) => selectableAssetIdSet.has(id)),
    [selectedAssetIds, selectableAssetIdSet],
  );

  const selectedAssetNames = useMemo(() => {
    const assetNameById = new Map<number, string>();

    for (const asset of assets) {
      const assetId = getNumericAssetId(asset);
      if (assetId === null || assetNameById.has(assetId)) {
        continue;
      }

      const fileName = String(asset.fileName ?? "").trim();
      assetNameById.set(
        assetId,
        fileName.length > 0 ? fileName : `Tai lieu #${assetId}`,
      );
    }

    return scopedSelectedAssetIds.map(
      (assetId) => assetNameById.get(assetId) ?? `Tai lieu #${assetId}`,
    );
  }, [assets, scopedSelectedAssetIds]);

  const selectedAssetIdSet = useMemo(
    () => new Set(scopedSelectedAssetIds),
    [scopedSelectedAssetIds],
  );

  const toggleAssetSelection = (asset: CourseAssetResponseDto) => {
    const assetId = getNumericAssetId(asset);
    if (assetId === null || !isAssetSelectableForChat(asset)) {
      return;
    }

    setSelectedAssetIds((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId],
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectableFilteredAssetIds.length === 0) {
      return;
    }

    setSelectedAssetIds((prev) => {
      const merged = new Set(prev);
      selectableFilteredAssetIds.forEach((id) => merged.add(id));
      return Array.from(merged);
    });
  };

  const handleClearSelection = () => {
    setSelectedAssetIds([]);
  };

  const handleOpenChatWithSelectedAssets = () => {
    if (scopedSelectedAssetIds.length === 0) {
      toast.error("Hãy chọn ít nhất 1 tài liệu đã phân tích để hỏi AI");
      return;
    }

    openPanel("CHAT", {
      courseId,
      selectedAssetIds: scopedSelectedAssetIds,
      selectedAssetNames,
    });
  };

  useEffect(() => {
    const isChatOpen = isOpen && type === "CHAT";
    if (!isChatOpen && scopedSelectedAssetIds.length === 0) {
      return;
    }

    openPanel("CHAT", {
      courseId,
      selectedAssetIds: scopedSelectedAssetIds,
      selectedAssetNames,
    });
  }, [
    isOpen,
    type,
    courseId,
    scopedSelectedAssetIds,
    selectedAssetNames,
    openPanel,
  ]);

  const { courseCommonAssets, linkAssets, sessionGroupedEntries } =
    useMemo(() => {
      const linkAssets = filteredAssets.filter(
        (asset) => asset.linkedType === "ExternalLink",
      );

      const nonLinkAssets = filteredAssets.filter(
        (asset) => asset.linkedType !== "ExternalLink",
      );

      const courseCommonAssets = nonLinkAssets.filter(
        (asset) => asset.linkedType === "Course",
      );

      const sessionAssets = nonLinkAssets.filter(
        (asset) => asset.linkedType === "Task" || asset.linkedType === "Log",
      );

      const groupedSessionAssets = sessionAssets.reduce<
        Record<string, CourseAssetResponseDto[]>
      >((acc, asset) => {
        const sourceName =
          asset.sourceName?.trim() && asset.sourceName.trim().length > 0
            ? asset.sourceName.trim()
            : "Nguồn khác";

        if (!acc[sourceName]) {
          acc[sourceName] = [];
        }

        acc[sourceName].push(asset);
        return acc;
      }, {});

      return {
        courseCommonAssets,
        linkAssets,
        sessionGroupedEntries: Object.entries(groupedSessionAssets).sort(
          (a, b) => a[0].localeCompare(b[0]),
        ),
      };
    }, [filteredAssets]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Tải tài liệu
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsFileDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Tải tệp lên
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsLinkDialogOpen(true)}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Dán liên kết
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tải tài liệu chung của khóa học</DialogTitle>
          </DialogHeader>
          <AssetUploader
            linkedId={courseId}
            linkedType="Course"
            onUploaded={() => setIsFileDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm tài liệu từ liên kết</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Liên kết</p>
              <Input
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Tên hiển thị (tuỳ chọn)</p>
              <Input
                value={linkDisplayName}
                onChange={(event) => setLinkDisplayName(event.target.value)}
                placeholder="Ví dụ: Đề cương môn học"
              />
            </div>

            <Button
              className="w-full"
              disabled={uploadLinkMutation.isPending}
              onClick={() => {
                const url = linkUrl.trim();
                if (!url) {
                  toast.error("Vui lòng nhập liên kết tài liệu");
                  return;
                }

                uploadLinkMutation.mutate({
                  body: {
                    url,
                    linkedId: courseId,
                    linkedType: "Course",
                    displayName: linkDisplayName.trim() || null,
                    category: 0,
                  },
                });
              }}
            >
              {uploadLinkMutation.isPending ? "Đang thêm..." : "Lưu liên kết"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      <div className="rounded-xl border bg-muted/30 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Đã chọn{" "}
            <span className="font-semibold">
              {scopedSelectedAssetIds.length}
            </span>
            /{selectableAssetIdSet.size} tài liệu có thể hỏi đáp AI.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={selectableFilteredAssetIds.length === 0}
              onClick={handleSelectAllFiltered}
            >
              Chọn theo bộ lọc ({selectableFilteredAssetIds.length})
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={scopedSelectedAssetIds.length === 0}
              onClick={handleClearSelection}
            >
              Bỏ chọn
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={scopedSelectedAssetIds.length === 0}
              onClick={handleOpenChatWithSelectedAssets}
            >
              Hỏi AI với tài liệu đã chọn
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : courseCommonAssets.length === 0 &&
        linkAssets.length === 0 &&
        sessionGroupedEntries.length === 0 ? (
        <EmptyState text="Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại." />
      ) : (
        <div className="space-y-6">
          {courseCommonAssets.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  Tài liệu chung của khóa học
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {courseCommonAssets.length} tệp
                </Badge>
              </div>

              <AssetGroup
                title=""
                assets={courseCommonAssets}
                onPreview={openPreview}
                onDelete={(asset) => handleDeleteAsset(asset)}
                selectedAssetIdSet={selectedAssetIdSet}
                onToggleSelection={toggleAssetSelection}
                boxed={false}
                showTitle={false}
              />
            </section>
          ) : null}

          {linkAssets.length > 0 ? (
            <LinkSection
              links={linkAssets}
              onDelete={(asset) => handleDeleteAsset(asset)}
            />
          ) : null}

          {sessionGroupedEntries.length > 0 ? (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Tài liệu theo buổi học</h3>
              <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
                {sessionGroupedEntries.map(([sourceName, groupAssets]) => (
                  <AssetGroup
                    key={sourceName}
                    title={sourceName}
                    assets={groupAssets}
                    onPreview={openPreview}
                    onDelete={(asset) => handleDeleteAsset(asset)}
                    selectedAssetIdSet={selectedAssetIdSet}
                    onToggleSelection={toggleAssetSelection}
                    boxed
                    showTitle
                  />
                ))}
              </div>
            </section>
          ) : null}
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
  onDelete,
  selectedAssetIdSet,
  onToggleSelection,
  boxed,
  showTitle,
}: {
  title: string;
  assets: CourseAssetResponseDto[];
  onPreview: (asset: PreviewAsset) => void;
  onDelete: (asset: CourseAssetResponseDto) => void;
  selectedAssetIdSet: Set<number>;
  onToggleSelection: (asset: CourseAssetResponseDto) => void;
  boxed?: boolean;
  showTitle?: boolean;
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
    <div className={cn(boxed ? "h-full rounded-xl border bg-card p-4" : "")}>
      {showTitle ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {assets.length} tệp
          </Badge>
        </div>
      ) : null}

      {assets.length === 0 ? (
        <EmptyState text="Không có tài liệu trong nhóm này." />
      ) : null}

      {documentAssets.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
          {documentAssets.map((asset) => {
            const assetId = getNumericAssetId(asset);
            const isSelectable =
              assetId !== null && isAssetSelectableForChat(asset);
            const isSelected =
              assetId !== null && selectedAssetIdSet.has(assetId);

            return (
              <div key={String(asset.id)} className="relative">
                {isSelectable ? (
                  <input
                    type="checkbox"
                    className="absolute left-2 top-2 z-20 h-4 w-4 cursor-pointer accent-primary"
                    checked={isSelected}
                    onChange={() => onToggleSelection(asset)}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Chọn tài liệu ${asset.fileName ?? ""} để chat`}
                  />
                ) : null}

                <AssetItem
                  asset={asset}
                  showSourceName={false}
                  onPreview={onPreview}
                  onDelete={() => onDelete(asset)}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      {imageAssets.length > 0 ? (
        <div className={cn("space-y-3", documentAssets.length > 0 && "mt-5")}>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Gallery ảnh
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2 justify-items-start">
            {imageAssets.map((asset) => {
              const assetId = getNumericAssetId(asset);
              const isSelectable =
                assetId !== null && isAssetSelectableForChat(asset);
              const isSelected =
                assetId !== null && selectedAssetIdSet.has(assetId);

              return (
                <div
                  key={String(asset.id)}
                  className="group relative aspect-square w-full max-w-44 overflow-hidden rounded-lg border bg-muted"
                >
                  {isSelectable ? (
                    <input
                      type="checkbox"
                      className="absolute left-1.5 top-1.5 z-20 h-4 w-4 cursor-pointer accent-primary"
                      checked={isSelected}
                      onChange={() => onToggleSelection(asset)}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`Chọn ảnh ${asset.fileName ?? ""} để chat`}
                    />
                  ) : null}

                  <button
                    type="button"
                    className="h-full w-full"
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
                  </button>

                  <button
                    type="button"
                    className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onDelete(asset);
                    }}
                    aria-label={`Gỡ liên kết ảnh ${asset.fileName ?? ""}`}
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent p-2">
                    <p className="truncate text-[11px] text-white">
                      {asset.fileName || "Ảnh"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {documentAssets.length === 0 && imageAssets.length === 0 ? (
        <EmptyState text="Không có tệp hiển thị sau khi lọc." />
      ) : null}
    </div>
  );
}

function LinkSection({
  links,
  onDelete,
}: {
  links: CourseAssetResponseDto[];
  onDelete: (asset: CourseAssetResponseDto) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Liên kết tài liệu</h3>
        <Badge variant="secondary" className="text-xs">
          {links.length} link
        </Badge>
      </div>

      <div className="space-y-2">
        {links.map((asset) => (
          <div
            key={String(asset.id)}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {asset.fileName || "Liên kết"}
              </p>
              <a
                href={asset.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 block truncate text-xs text-blue-600 hover:underline"
              >
                {asset.url}
              </a>
            </div>

            <Button variant="outline" size="sm" onClick={() => onDelete(asset)}>
              Unlink
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function getNumericAssetId(asset: CourseAssetResponseDto): number | null {
  const assetId = Number(asset.id);
  return Number.isFinite(assetId) && assetId > 0 ? assetId : null;
}

function isAssetSelectableForChat(asset: CourseAssetResponseDto): boolean {
  if (asset.linkedType === "ExternalLink") {
    return false;
  }

  const status = String(asset.status ?? "").toLowerCase();
  return status === "analyzed";
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
