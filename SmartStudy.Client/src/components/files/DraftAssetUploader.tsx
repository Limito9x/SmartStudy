import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";

registerPlugin(FilePondPluginFileValidateType);

interface DraftAssetUploaderProps {
  onFilesChange: (fileItems: any[]) => void; // Hàm cập nhật state
}

export default function DraftAssetUploader({
  onFilesChange,
}: DraftAssetUploaderProps) {
  return (
    <FilePond
      onupdatefiles={onFilesChange}
      allowMultiple={true}
      server={null}
      labelIdle='Kéo thả hoặc <span class="filepond--label-action">chọn file nộp bài</span>'
    />
  );
}
