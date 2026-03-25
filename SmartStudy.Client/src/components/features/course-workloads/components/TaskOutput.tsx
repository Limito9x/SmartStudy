import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { LogDoc } from "@/services/api";
import { NotebookPen } from "lucide-react";
import AssetListItem from "../shared/AssetListItem";
import ContextUploader from "../shared/ContextUploader";

interface TaskOutputProps {
  logs: LogDoc[];
  taskId: number;
}

export default function TaskOutput({ logs, taskId }: TaskOutputProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <NotebookPen size={16} />
            Nhật ký và bài làm
          </CardTitle>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                Viết nhật ký
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Tạo nhanh nhật ký học tập</DialogTitle>
                <DialogDescription>
                  Biểu mẫu tạm thời để thử nghiệm quy trình ghi log và đính kèm
                  tệp.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Textarea
                  rows={6}
                  placeholder="Mô tả kết quả học tập, khó khăn và hướng cải thiện..."
                />
                <ContextUploader
                  linkedId={taskId}
                  linkedType="Log"
                  buttonText="Đính kèm tệp cho log"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Đóng
                </Button>
                <Button disabled>Lưu nháp</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
