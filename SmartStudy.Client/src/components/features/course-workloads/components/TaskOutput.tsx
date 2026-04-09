import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import AssetPreviewDialog from "@/components/files/AssetPreviewDialog";
import { useAssetPreview } from "@/hooks/useAssetPreview";
import type { LogDoc } from "@/services/api";
import AssetListItem from "../shared/AssetListItem";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { useState } from "react";
import LogFormContainer from "@/components/form-containers/LogFormContainer";

interface TaskOutputProps {
  logs: LogDoc[];
  taskId: number;
}

export default function TaskOutput({ logs, taskId }: TaskOutputProps) {
  const [isInlineFormOpen, setIsInlineFormOpen] = useState(false);
  const { previewAsset, openPreview, closePreview } = useAssetPreview();

  return (
    <section className="space-y-3 pb-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Nhật ký và bài làm
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => setIsInlineFormOpen((prev) => !prev)}
        >
          <Pencil size={14} className="mr-1" />
          {isInlineFormOpen ? "Đóng" : "Ghi nhận"}
        </Button>
      </div>

      {isInlineFormOpen ? (
        <div className="rounded-md border bg-background p-3">
          <LogFormContainer
            taskId={taskId}
            onSuccess={() => setIsInlineFormOpen(false)}
          />
        </div>
      ) : null}

      <div>
        {logs.length === 0 ? (
          <div className="rounded-md bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
            Chưa có nhật ký đầu ra
          </div>
        ) : (
          <ScrollArea className="max-h-72 pr-2">
            <div className="space-y-3">
              {logs.map((entry, index) => {
                const log = entry.log;
                if (!log) {
                  return null;
                }

                return (
                  <div
                    key={String(log.id ?? `log-${index}`)}
                    className="space-y-2 rounded-md bg-stone-100/70 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <strong>{formatDuration(log.actualDuration)}</strong>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        Độ khó: {getDifficultyLabel(log.difficultyLevel)}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span>
                        {getComprehensionStars(log.comprehensionLevel)}
                      </span>
                    </div>

                    {log.note ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {log.note}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Không có nội dung mô tả.
                      </p>
                    )}

                    {(entry.assets?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {entry.assets?.map((asset) => (
                          <AssetListItem
                            key={String(asset.id)}
                            asset={asset}
                            onPreview={openPreview}
                          />
                        ))}
                      </div>
                    ) : null}

                    <div className="pt-1">
                      <Badge variant="outline" className="text-[11px]">
                        {log.completedAt
                          ? format(
                              new Date(log.completedAt),
                              "hh:mm dd/MM/yyyy",
                            )
                          : "Chưa có thời gian hoàn thành"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      <AssetPreviewDialog asset={previewAsset} onClose={closePreview} />
    </section>
  );
}

function formatDuration(value: number | string | null) {
  if (value == null || value === "") {
    return "-- phút";
  }

  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "-- phút";
  }

  return `${minutes} phút`;
}

function getDifficultyLabel(value: number | string | null) {
  const level = Number(value);
  if (!Number.isFinite(level)) {
    return "Chưa cập nhật";
  }

  if (level >= 2) {
    return "Khó";
  }

  if (level === 1) {
    return "Trung bình";
  }

  return "Dễ";
}

function getComprehensionStars(value: number | string | null) {
  const level = Number(value);
  if (!Number.isFinite(level)) {
    return "--";
  }

  return "*".repeat(Math.max(1, Math.min(4, level + 1)));
}
