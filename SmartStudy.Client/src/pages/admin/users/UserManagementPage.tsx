import { useState, useEffect } from "react";
import { useGetAdminUsers } from "@/hooks/entities/useAdminUsers";
import DataTable from "@/components/data-table/DataTable";
import { userColumns } from "@/features/admin/users/userColumns";
import ToggleStatusDialog from "@/features/admin/users/ToggleStatusDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

export default function UserManagementPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  // Reset to page 0 when search term changes
  useEffect(() => {
    if (debouncedSearch !== searchInput) {
      setPageIndex(0);
    }
  }, [debouncedSearch, searchInput]);

  const searchTerm = debouncedSearch || undefined;

  const { data, isLoading, error } = useGetAdminUsers({
    pageIndex,
    pageSize,
    searchTerm,
  });

  const handlePreviousPage = () => {
    if (data?.hasPreviousPage) {
      setPageIndex(Math.max(0, pageIndex - 1));
    }
  };

  const handleNextPage = () => {
    if (data?.hasNextPage) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPageIndex(0);
  };

  const displayData = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = pageIndex + 1;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Quản lý Người dùng</h1>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Info Section */}
      {!isLoading && data && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Tổng <span className="font-semibold">{data.totalCount}</span> người dùng
          </span>
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm">
              Hiển thị:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      )}

      {/* Data Table or Loading State */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          Lỗi khi tải dữ liệu người dùng. Vui lòng thử lại.
        </div>
      ) : (
        <DataTable data={displayData} columns={userColumns} />
      )}

      {/* Pagination Controls */}
      {!isLoading && data && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!data.hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!data.hasNextPage}
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Status Dialog */}
      <ToggleStatusDialog />
    </div>
  );
}
