import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // Báo cho nó biết TableMeta giờ đây sẽ có thêm "đồ chơi"
  interface TableMeta<TData extends RowData> {
    onEdit?: (rowData: TData) => void;
    onDelete?: (rowData: TData) => void;
  }
}
