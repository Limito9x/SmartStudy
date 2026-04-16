import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlanTemplate } from "@/hooks/entities/usePlanTemplate.ts";
import TemplateCard from "@/components/features/plan/TemplateCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { PlanTemplateDto } from "@/services/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TemplateTypeTab = "Academic" | "Personal";

export default function TemplateGalleryPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [activeType, setActiveType] = useState<TemplateTypeTab>("Academic");
  const [accumulatedTemplates, setAccumulatedTemplates] = useState<
    PlanTemplateDto[]
  >([]);
  const pageSize = 12;

  const debouncedSearch = useDebounce(searchInput, 500);

  const { getPlanTemplates } = usePlanTemplate({
    pageIndex,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    type: activeType,
  });

  const templates = useMemo(
    () => getPlanTemplates.data?.items ?? [],
    [getPlanTemplates.data],
  );
  const hasNextPage = !!getPlanTemplates.data?.hasNextPage;

  useEffect(() => {
    if (!getPlanTemplates.data) {
      return;
    }

    setAccumulatedTemplates((prev) => {
      const merged = pageIndex === 0 ? templates : [...prev, ...templates];
      const uniqueById = new Map<string, PlanTemplateDto>();

      merged.forEach((item, index) => {
        const key =
          item.id !== undefined && item.id !== null
            ? String(item.id)
            : `${item.name || "template"}-${index}`;

        if (!uniqueById.has(key)) {
          uniqueById.set(key, item);
        }
      });

      return Array.from(uniqueById.values());
    });
  }, [getPlanTemplates.data, pageIndex, templates]);

  const handleLoadMore = () => {
    if (hasNextPage) {
      setPageIndex((prev) => prev + 1);
    }
  };

  const emptyText =
    activeType === "Academic"
      ? "Hiện chưa có lộ trình đại học phù hợp với từ khóa tìm kiếm."
      : "Hiện chưa có kế hoạch cá nhân phù hợp với từ khóa tìm kiếm.";

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2 self-start text-left">
          <h1 className="text-3xl font-bold">Template Marketplace</h1>
          <p className="text-sm text-muted-foreground">
            Khám phá template học tập sẵn sàng dùng ngay cho từng mục tiêu của
            bạn.
          </p>
        </div>

        <div className="w-full md:w-75">
          <Input
            placeholder="Tìm kiếm template..."
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPageIndex(0);
              setAccumulatedTemplates([]);
            }}
          />
        </div>
      </div>

      <Tabs
        value={activeType}
        onValueChange={(nextValue) => {
          const parsedType = nextValue as TemplateTypeTab;
          setActiveType(parsedType);
          setPageIndex(0);
          setAccumulatedTemplates([]);
        }}
      >
        <TabsList className="w-full justify-start gap-2 md:w-auto">
          <TabsTrigger value="Academic">Lộ trình Đại học</TabsTrigger>
          <TabsTrigger value="Personal">Kế hoạch Cá nhân</TabsTrigger>
        </TabsList>
      </Tabs>

      {getPlanTemplates.isLoading && accumulatedTemplates.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      ) : getPlanTemplates.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          Lỗi khi tải template. Vui lòng thử lại.
        </div>
      ) : accumulatedTemplates.length === 0 ? (
        <div className="rounded border bg-muted/40 p-6 text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {accumulatedTemplates.map((template) => (
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

      {accumulatedTemplates.length > 0 && hasNextPage ? (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={getPlanTemplates.isFetching || !hasNextPage}
            >
              {getPlanTemplates.isFetching ? "Đang tải..." : "Tải thêm"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
