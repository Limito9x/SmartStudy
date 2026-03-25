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
import { Paperclip } from "lucide-react";
import AssetUploader from "./AssetUploader";
import { type AssetLinkType } from "@/services/api";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Nút bấm hiển thị ngoài UI */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8">
          <Paperclip size={14} />
          {buttonText}
        </Button>
      </DialogTrigger>

      {/* Modal chứa khu vực Kéo thả */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu ({linkedType})</DialogTitle>
          <DialogDescription>
            Tài liệu sẽ được đính kèm vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <AssetUploader
            linkedId={linkedId}
            linkedType={linkedType}
            onUploaded={() => {
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
