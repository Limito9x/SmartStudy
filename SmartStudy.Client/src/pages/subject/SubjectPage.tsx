import { useSearchParams } from "react-router-dom";
import { useSubject } from "@/hooks/entities/useSubject";
import SubjectForm from "@/components/forms/subject/SubjectForm";
import { useDialogStore } from "@/stores/useDialogStore";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/ui/custom/search-bar";
import TablePagination from "@/components/ui/custom/table-pagination";
import DataTable from "@/components/data-table/DataTable";
import { subjectColumns } from "@/components/data-table/columns/SubjectColumns";
import type { ResponseSubjectDto } from "@/services/api/types.gen";
import ConfirmDelete from "@/components/ui/common/ConfirmDelete";

const INIT_SEARCH_PARAMS = {
  page: 1,
  pageSize: 10,
};

export default function SubjectPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || INIT_SEARCH_PARAMS.page);
  const pageSize = Number(
    searchParams.get("pageSize") || INIT_SEARCH_PARAMS.pageSize,
  );
  const search = searchParams.get("search") || "";

  const handleSearch = (newSearch: string) => {
    setSearchParams({
      page: "1",
      pageSize: String(pageSize),
      search: newSearch,
    });
  };

  const { data: subjectsData } = useSubject().getSubjects(
    page,
    pageSize,
    search,
  );
  const createSubjectMutation = useSubject().createSubject;
  const updateSubjectMutation = useSubject().updateSubject;
  const deleteSubjectMutation = useSubject().deleteSubject;

  const { openDialog, closeDialog } = useDialogStore();

  const handleOpenCreateDialog = () => {
    openDialog({
      title: "Tạo môn học mới",
      view: (
        <SubjectForm
          defaultValues={{
            name: "",
            credits: 3,
            type: "Theory",
          }}
          onSubmit={(data) => {
            createSubjectMutation.mutate({
              body: data,
            });
            closeDialog();
          }}
        />
      ),
    });
  };

  const handleOpenEditDialog = (subject: ResponseSubjectDto) => {
    openDialog({
      title: "Cập nhật thông tin môn học",
      view: (
        <SubjectForm
          defaultValues={{
            name: subject.name,
            credits: Number(subject.credits),
            type: subject.type,
          }}
          onSubmit={(data) => {
            updateSubjectMutation.mutate({
              path: {
                subjectId: Number(subject.id),
              },
              body: data,
            });
            closeDialog();
          }}
        />
      ),
    });
  };

  const handleDeleteSubject = (subject: ResponseSubjectDto) => {
    openDialog({
      title: "Xác nhận xóa môn học",
      view: (
        <ConfirmDelete
          message={`Bạn có chắc chắn muốn xóa môn học "${subject.name}" không?`}
          onConfirm={() => {
            deleteSubjectMutation.mutate({
              path: {
                subjectId: Number(subject.id),
              },
            });
            closeDialog();
          }}
          onCancel={() => {
            closeDialog();
          }}
        />
      ),
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl text-left font-bold mb-4">Danh sách môn học</h1>
      <div className="flex items-center justify-between mb-4">
        <SearchBar placeholder="Tìm kiếm môn học..." onSearch={handleSearch} />
        <Button onClick={handleOpenCreateDialog}>Thêm môn học</Button>
      </div>
      <div className="mt-4">
        <DataTable
          data={subjectsData?.items || []}
          columns={subjectColumns}
          meta={{
            onEdit: handleOpenEditDialog,
            onDelete: handleDeleteSubject,
          }}
        />
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={Number(subjectsData?.totalCount) || 0}
          onPaginationChange={(newPage, newPageSize) => {
            setSearchParams({
              page: String(newPage),
              pageSize: String(newPageSize),
              search,
            });
          }}
        />
      </div>
    </div>
  );
}
