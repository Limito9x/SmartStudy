import { Field, FieldLabel } from "@/components/ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPaginationChange: (page: number, pageSize: number) => void;
}

export default function TablePagination({
  page,
  pageSize,
  totalItems,
  onPaginationChange,
}: TablePaginationProps) {
  // 1. Tính tổng số trang
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // 2. Thuật toán sinh mảng trang (Hiển thị thông minh dấu ...)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (page >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center gap-4 mt-4">
      <Field orientation="horizontal" className="w-fit flex items-center gap-2">
        <FieldLabel
          htmlFor="select-rows-per-page"
          className="text-sm text-muted-foreground whitespace-nowrap"
        >
          Số dòng mỗi trang
        </FieldLabel>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPaginationChange(1, Number(value))} // Đổi size phải văng về trang 1
        >
          <SelectTrigger className="w-20 h-8" id="select-rows-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {/* KHÚC 2: CÁC NÚT BẤM CHUYỂN TRANG */}
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          {/* Nút Prev */}
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault(); // Chống giật trang web
                if (page > 1) onPaginationChange(page - 1, pageSize);
              }}
              // Làm mờ và tắt click nếu đang ở trang 1
              className={
                page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>

          {/* Vòng lặp in số trang */}
          {pages.map((p, idx) => (
            <PaginationItem key={idx}>
              {p === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={page === p}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page !== p) onPaginationChange(Number(p), pageSize);
                  }}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Nút Next */}
          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) onPaginationChange(page + 1, pageSize);
              }}
              className={
                page === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
