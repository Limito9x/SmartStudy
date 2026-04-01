import type { AssetResponseDto } from "@/services/api";
import AssetListItem from "../shared/AssetListItem";
import ContextUploader from "../shared/ContextUploader";

interface TaskInputProps {
  docs: AssetResponseDto[];
  taskId: number;
}

export default function TaskInput({ docs, taskId }: TaskInputProps) {
  return (
    <section className="space-y-3 border-b pb-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Tài liệu hướng dẫn
        </p>
        <ContextUploader
          linkedId={taskId}
          linkedType="Task"
          buttonText="Đính kèm"
        />
      </div>

      <div>
        {docs.length === 0 ? (
          <div className="rounded-md bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
            Chưa có tài liệu đầu vào
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <AssetListItem key={String(doc.id)} asset={doc} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
