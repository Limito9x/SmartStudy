import { useSearchParams } from "react-router-dom";
import { useSubject } from "@/hooks/entities/useSubject";
import { useDialogStore } from "@/stores/useDialogStore";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/ui/custom/search-bar";
import TablePagination from "@/components/ui/custom/table-pagination";
import DataTable from "@/components/data-table/DataTable";
import {
  academicSubjectColumns,
  personalSubjectColumns,
} from "@/components/data-table/columns/SubjectColumns";
import type { ResponseSubjectDto } from "@/services/api/types.gen";
import { subjectApiMapper } from "@/utils/mapper/apiMapper";
import BulkSubjectForm from "@/components/forms/subject/BulkSubjectForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { StudyPlanType } from "@/services/api/types.gen";
import { toast } from "sonner";

const INIT_SEARCH_PARAMS = {
  page: 1,
  pageSize: 10,
  type: "Academic",
};

export default function SubjectPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openBulkDialog, setOpenBulkDialog] = useState(false);

  const handleOpenCreateDialog = () => {
    setOpenBulkDialog(true);
  };

  const page = Number(searchParams.get("page") || INIT_SEARCH_PARAMS.page);
  const pageSize = Number(
    searchParams.get("pageSize") || INIT_SEARCH_PARAMS.pageSize,
  );
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || INIT_SEARCH_PARAMS.type;

  const currentType: StudyPlanType =
    type === "Academic" || type === "Personal" ? type : "Academic";

  const handleSearch = (newSearch: string) => {
    setSearchParams({
      page: "1",
      pageSize: String(pageSize),
      search: newSearch,
      type: currentType,
    });
  };

  const { data: subjectsData } = useSubject().getSubjects({
    pageIndex: page,
    pageSize,
    search,
    type: currentType,
  });
  const deleteSubjectMutation = useSubject().deleteSubject;
  const bulkCreateSubjectsMutation = useSubject().bulkCreateSubjects;

  const { openDialog, closeDialog } = useDialogStore();

  const handleDeleteSubject = (subject: ResponseSubjectDto) => {
    openDialog("CONFIRM_DELETE", {
      itemType: "môn học",
      itemName: subject.name,
      onConfirm: () => {
        deleteSubjectMutation.mutate(
          {
            path: { subjectId: Number(subject.id) },
          },
          {
            onSuccess: () => {
              toast.success("Xóa môn học thành công");
            },
            onError: () => {
              toast.error("Xóa môn học thất bại");
            },
          },
        );
        closeDialog();
      },
    });
  };

  const handleTabChange = (newType: string) => {
    setSearchParams({
      page: "1",
      pageSize: String(pageSize),
      search,
      type: newType,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl text-left font-bold mb-4">Danh sách môn học</h1>
      <Dialog
        open={openBulkDialog}
        onOpenChange={() => setOpenBulkDialog(false)}
      >
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-blue-600">
              Thêm môn học mới
            </DialogTitle>
          </DialogHeader>
          <BulkSubjectForm
            type={currentType}
            onSubmit={(values) => {
              bulkCreateSubjectsMutation.mutate(
                {
                  body: values.subjects.map((subject) =>
                    subjectApiMapper.toRequestSubjectDto(subject),
                  ),
                },
                {
                  onSuccess: () => {
                    setOpenBulkDialog(false);
                    toast.success("Thêm môn học thành công");
                  },
                },
              );
            }}
            onCancel={() => setOpenBulkDialog(false)}
          />
        </DialogContent>
      </Dialog>
      <div className="mt-4">
        <Tabs defaultValue={currentType} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="Academic">Đại học</TabsTrigger>
            <TabsTrigger value="Personal">Cá nhân</TabsTrigger>
          </TabsList>
          <div className="flex items-center justify-between mb-4">
            <SearchBar
              placeholder="Tìm kiếm môn học..."
              onSearch={handleSearch}
            />
            <Button onClick={handleOpenCreateDialog}>Thêm môn học</Button>
          </div>
          <TabsContent value="Academic">
            <DataTable
              data={subjectsData?.items || []}
              columns={academicSubjectColumns}
              meta={{
                onEdit: (subject: ResponseSubjectDto) => {
                  openDialog("SUBJECT_FORM", {
                    subjectId: Number(subject.id),
                  });
                },
                onDelete: handleDeleteSubject,
              }}
            />
          </TabsContent>
          <TabsContent value="Personal">
            <DataTable
              data={subjectsData?.items || []}
              columns={personalSubjectColumns}
              meta={{
                onEdit: (subject: ResponseSubjectDto) => {
                  openDialog("SUBJECT_FORM", {
                    subjectId: Number(subject.id),
                  });
                },
                onDelete: handleDeleteSubject,
              }}
            />
          </TabsContent>
        </Tabs>
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={Number(subjectsData?.totalCount) || 0}
          onPaginationChange={(newPage, newPageSize) => {
            setSearchParams({
              page: String(newPage),
              pageSize: String(newPageSize),
              search,
              type: currentType,
            });
          }}
        />
      </div>
    </div>
  );
}
