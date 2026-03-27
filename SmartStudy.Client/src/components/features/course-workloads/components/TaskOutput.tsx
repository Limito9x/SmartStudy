import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogDoc } from "@/services/api";
import { NotebookPen } from "lucide-react";
import AssetListItem from "../shared/AssetListItem";
import { useDialogStore } from "@/stores/useDialogStore";

interface TaskOutputProps {
  logs: LogDoc[];
  taskId: number;
}

export default function TaskOutput({ logs, taskId }: TaskOutputProps) {
  const { openDialog } = useDialogStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <NotebookPen size={16} />
            Nhật ký và bài làm
          </CardTitle>
          <Button
            size="sm"
            className="h-8"
            onClick={() =>
              openDialog("LOG_WORK_FORM", {
                taskId,
              })
            }
          >
            Ghi nhận công việc
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có kết quả đầu ra cho công việc này.
          </p>
        ) : (
          <ScrollArea className="h-72 pr-2">
            <div className="space-y-3">
              {logs.map((entry, index) => {
                const log = entry.log;
                if (!log) {
                  return null;
                }

                return (
                  <div
                    key={String(log.id ?? `log-${index}`)}
                    className="space-y-2 rounded-lg border p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Log #{String(log.id)}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {log.completedAt
                          ? new Date(log.completedAt).toLocaleString("vi-VN")
                          : "Chưa có thời gian hoàn thành"}
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
                          <AssetListItem key={String(asset.id)} asset={asset} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
