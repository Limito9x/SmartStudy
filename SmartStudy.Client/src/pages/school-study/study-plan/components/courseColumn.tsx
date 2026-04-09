import { Input } from "@/components/ui/input";
import type { SimpleResponseCourseDto } from "@/services/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

export interface CourseTableMeta {
  savingCourseId: number | null;
  onSaveFinalScore: (courseId: number, score: number) => Promise<void>;
}

interface FinalScoreCellProps {
  course: SimpleResponseCourseDto;
  meta?: CourseTableMeta;
}

const toDisplayScore = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
};

function FinalScoreCell({ course, meta }: FinalScoreCellProps) {
  const courseId = Number(course.id ?? 0);
  const persistedValue = useMemo(
    () => toDisplayScore(course.finalScore),
    [course.finalScore],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(persistedValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSaving = Boolean(meta?.savingCourseId === courseId);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(persistedValue);
    }
  }, [isEditing, persistedValue]);

  const cancelEdit = () => {
    setDraftValue(persistedValue);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!meta || !courseId) {
      setIsEditing(false);
      return;
    }

    const nextValue = draftValue.trim();
    const currentValue = persistedValue.trim();

    if (!nextValue || nextValue === currentValue) {
      cancelEdit();
      return;
    }

    const parsed = Number(nextValue);
    if (!Number.isFinite(parsed)) {
      cancelEdit();
      return;
    }

    try {
      setIsSubmitting(true);
      await meta.onSaveFinalScore(courseId, parsed);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        className="w-24 rounded-sm border border-transparent px-2 py-1 text-left text-sm transition-colors hover:border-slate-300 hover:bg-slate-100"
        onClick={() => setIsEditing(true)}
      >
        {persistedValue || "--"}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      type="number"
      step="0.1"
      className="h-8 w-24"
      value={draftValue}
      disabled={isSaving || isSubmitting}
      onChange={(event) => setDraftValue(event.target.value)}
      onBlur={() => {
        void saveEdit();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void saveEdit();
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          cancelEdit();
        }
      }}
    />
  );
}

export const getCourseColumns = ({
  isAcademicPlan,
}: {
  isAcademicPlan: boolean;
}): ColumnDef<SimpleResponseCourseDto>[] => {
  const sharedColumns: ColumnDef<SimpleResponseCourseDto>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-left">Tên môn học</div>,
      cell: ({ row }) => (
        <div className="text-left">{row.original.name || "-"}</div>
      ),
    },
    {
      id: "finalScore",
      header: () => <div className="text-center">Điểm</div>,
      cell: ({ row, table }) => {
        const meta = table.options.meta as CourseTableMeta | undefined;
        return (
          <div className="flex justify-center">
            <FinalScoreCell course={row.original} meta={meta} />
          </div>
        );
      },
    },
  ];

  if (!isAcademicPlan) {
    return sharedColumns;
  }

  return [
    {
      id: "code",
      header: () => <div className="text-center">Mã môn học</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.subject?.code || "-"}</div>
      ),
    },
    sharedColumns[0],
    {
      id: "credits",
      header: () => <div className="text-center">Tín chỉ</div>,
      cell: ({ row }) => {
        const credits = row.original.subject?.credits;
        return (
          <div className="text-center">
            {credits === null || credits === undefined || credits === ""
              ? "-"
              : String(credits)}
          </div>
        );
      },
      accessorFn: (course) => {
        const credits = course.subject?.credits;
        return credits === null || credits === undefined || credits === ""
          ? "-"
          : String(credits);
      },
    },
    sharedColumns[1],
  ];
};
