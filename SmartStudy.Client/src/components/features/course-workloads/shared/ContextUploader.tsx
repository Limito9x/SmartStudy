import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AssetUploader from "@/components/files/AssetUploader";
import type { AssetLinkType } from "@/services/api";
import { Paperclip } from "lucide-react";

interface ContextUploaderProps {
  linkedId: number;
  linkedType: AssetLinkType;
  buttonText?: string;
}

export default function ContextUploader({
  linkedId,
  linkedType,
  buttonText = "Đính kèm tài liệu",
}: ContextUploaderProps) {
  const [open, setOpen] = useState(false);
  console.log("ContextUploader props:", { linkedId, linkedType });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Paperclip size={14} />
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải tài liệu lên hệ thống</DialogTitle>
          <DialogDescription>
            Tệp sẽ được gắn vào đối tượng {linkedType} ngay sau khi tải lên
            thành công.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <AssetUploader linkedId={linkedId} linkedType={linkedType} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
