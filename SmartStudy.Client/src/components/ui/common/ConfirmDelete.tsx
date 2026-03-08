import { Button } from "../button";

interface ConfirmDeleteProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDelete({
  message,
  onConfirm,
    onCancel,
}: ConfirmDeleteProps) {
  return (
    <div className="p-4">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Hủy</Button>
            <Button variant="destructive" onClick={onConfirm}>Xóa</Button>
        </div>
    </div>
  );
}