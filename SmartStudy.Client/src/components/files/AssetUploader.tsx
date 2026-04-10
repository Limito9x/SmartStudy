import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { uploadAssetsMutation } from "@/services/api/@tanstack/react-query.gen";
import { formDataBodySerializer } from "@/services/api/client";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { type AssetLinkType } from "@/services/api";
import { invalidateAssetContext } from "@/utils/query-invalidate";

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

interface AssetUploaderProps {
  linkedId: number;
  linkedType: AssetLinkType;
  onUploaded?: () => void;
}

export default function AssetUploader({
  linkedId,
  linkedType,
  onUploaded,
}: AssetUploaderProps) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    ...uploadAssetsMutation({
      ...formDataBodySerializer,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  });

  return (
    <FilePond
      allowMultiple={true}
      server={{
        process: (
          _fieldName,
          file,
          _metadata,
          load,
          error,
          progress,
          abort,
        ) => {
          uploadMutation
            .mutateAsync({
              body: {
                file: [file] as any,
                linkedId: linkedId,
                linkedType: linkedType,
              },
            })
            .then((res: any) => {
              progress(true, file.size, file.size);
              const firstUploaded = Array.isArray(res) ? res[0] : res;
              load(String(firstUploaded?.id ?? "success"));

              invalidateAssetContext(queryClient, linkedType, linkedId);
              onUploaded?.();
            })
            .catch((err) => {
              console.error("Lỗi upload:", err);
              error("Upload thất bại");
            });

          return {
            abort: () => {
              abort();
            },
          };
        },
        revert: null,
        restore: null,
        load: null,
        fetch: null,
      }}
      labelIdle='Kéo thả hoặc <span class="filepond--label-action">chọn file</span>'
    />
  );
}
