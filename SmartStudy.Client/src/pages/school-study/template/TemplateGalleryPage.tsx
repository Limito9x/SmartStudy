import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlanTemplate } from "@/hooks/entities/usePlanTemplate.ts";
import TemplateCard from "@/components/features/plan/TemplateCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TemplateGalleryPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 12;

  const debouncedSearch = useDebounce(searchInput, 500);

  const { getPlanTemplates } = usePlanTemplate({
    pageIndex,
    pageSize,
    searchTerm: debouncedSearch || undefined,
  });

  const templates = useMemo(
    () => getPlanTemplates.data?.items ?? [],
    [getPlanTemplates.data],
  );
  const totalPages = Number(getPlanTemplates.data?.totalPages ?? 1);
  const hasPreviousPage = !!getPlanTemplates.data?.hasPreviousPage;
  const hasNextPage = !!getPlanTemplates.data?.hasNextPage;

  const handlePreviousPage = () => {
    setPageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPageIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Thư viện template</h1>
        <p className="text-sm text-muted-foreground">
          Chọn template phù hợp và nhân bản nhanh để bắt đầu kế hoạch học tập.
        </p>
      </div>

      <div className="max-w-lg">
        <Input
          placeholder="Tìm kiếm template..."
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setPageIndex(0);
          }}
        />
      </div>

      {getPlanTemplates.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      ) : getPlanTemplates.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          Lỗi khi tải template. Vui lòng thử lại.
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded border bg-muted/40 p-6 text-sm text-muted-foreground">
          Không có template nào phù hợp với từ khóa tìm kiếm.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={(selectedTemplate) => {
                navigate(`/app/templates/${selectedTemplate.id}`);
              }}
            />
          ))}
        </div>
      )}

      {!getPlanTemplates.isLoading && templates.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {pageIndex + 1} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasNextPage}
            >
              Sau
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
