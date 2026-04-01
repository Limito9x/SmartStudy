import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CourseCompletionFormProps {
  courseName: string;
  defaultFinalScore: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (finalScore: number) => void;
}

export default function CourseCompletionForm({
  courseName,
  defaultFinalScore,
  isSubmitting,
  onCancel,
  onSubmit,
}: CourseCompletionFormProps) {
  const [finalScore, setFinalScore] = useState(defaultFinalScore);

  useEffect(() => {
    setFinalScore(defaultFinalScore);
  }, [defaultFinalScore]);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const score = Number(finalScore.trim());

        if (!finalScore.trim() || Number.isNaN(score)) {
          return;
        }

        onSubmit(score);
      }}
    >
      <p className="text-sm text-muted-foreground">
        Xác nhận hoàn thành khóa học <strong>{courseName}</strong>.
      </p>

      <div className="space-y-2">
        <label htmlFor="final-score" className="text-sm font-medium">
          Điểm tổng kết
        </label>
        <Input
          id="final-score"
          type="number"
          step="0.1"
          min="0"
          value={finalScore}
          disabled={isSubmitting}
          onChange={(event) => setFinalScore(event.target.value)}
          placeholder="Nhập điểm tổng kết"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang cập nhật..." : "Hoàn thành khóa học"}
        </Button>
      </div>
    </form>
  );
}
