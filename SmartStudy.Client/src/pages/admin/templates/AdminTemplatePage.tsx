import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileStack } from "lucide-react";
import DataTable from "@/components/data-table/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlanTemplate } from "@/hooks/entities/usePlanTemplate.ts";
import { createTemplateColumns } from "@/features/admin/templates/templateColumns";
import { useDialogStore } from "@/stores/useDialogStore";
import type { PlanTemplateDto, UpdatePlanTemplateDto } from "@/services/api";

export default function AdminTemplatePage() {
  const navigate = useNavigate();
  const { openDialog } = useDialogStore();

  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 20;
  const debouncedSearch = useDebounce(searchInput, 400);

  const { getPlanTemplates, deletePlanTemplate, togglePublish } =
    usePlanTemplate({
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

  const columns = useMemo(
    () =>
      createTemplateColumns({
        onView: (template) => {
          navigate(`/admin/templates/${template.id}`);
        },
        onEdit: (template) => {
          openDialog("PLAN_TEMPLATE_EDIT", {
            templateId: Number(template.id),
            defaultValues: {
              name: String(template.name || ""),
              description: template.description ?? null,
              isPublic: !!template.isPublic,
            },
          });
        },
        onDelete: (template) => {
          openDialog("CONFIRM_DELETE", {
            itemType: "template",
            itemName: String(template.name || ""),
            onConfirm: () => {
              deletePlanTemplate.mutate({
                path: {
                  templateId: Number(template.id),
                },
              });
            },
          });
        },
        onTogglePublish: (template) => {
          const payload: Omit<UpdatePlanTemplateDto, "isPublic"> & {
            isPublic: boolean;
          } = {
            name: String(template.name || ""),
            description: template.description ?? null,
            isPublic: !!template.isPublic,
          };

          togglePublish(Number(template.id), payload);
        },
      }),
    [navigate, openDialog, deletePlanTemplate, togglePublish],
  );

  const handleOpenCreateDialog = () => {
    openDialog("PLAN_TEMPLATE_SELECT_PLAN", {});
  };

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileStack className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Quản lý template</h1>
        </div>
        <Button onClick={handleOpenCreateDialog}>+ Tạo từ kế hoạch</Button>
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
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : getPlanTemplates.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          Lỗi khi tải danh sách template.
        </div>
      ) : (
        <DataTable<PlanTemplateDto> data={templates} columns={columns} />
      )}

      {!getPlanTemplates.isLoading && templates.length > 0 ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Trang {pageIndex + 1} / {totalPages}
          </span>
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
