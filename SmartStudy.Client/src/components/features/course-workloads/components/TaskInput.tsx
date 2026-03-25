import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssetResponseDto } from "@/services/api";
import { BookOpen } from "lucide-react";
import AssetListItem from "../shared/AssetListItem";
import ContextUploader from "../shared/ContextUploader";

interface TaskInputProps {
  docs: AssetResponseDto[];
  taskId: number;
}

export default function TaskInput({ docs, taskId }: TaskInputProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen size={16} />
          Tài liệu hướng dẫn
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có tài liệu đầu vào cho công việc này.
          </p>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <AssetListItem key={String(doc.id)} asset={doc} />
            ))}
          </div>
        )}

        <ContextUploader
          linkedId={taskId}
          linkedType="Task"
          buttonText="Đính kèm tài liệu"
        />
      </CardContent>
    </Card>
  );
}
