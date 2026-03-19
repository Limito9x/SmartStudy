// components/ui/custom/AssetUploader.tsx
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { useQueryClient } from "@tanstack/react-query";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { type AssetLinkType } from "@/services/api";
import { getCourseAssetQueryKey } from "@/services/api/@tanstack/react-query.gen";

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

  return (
    <FilePond
      allowMultiple={true}
      server={{
        process: {
          url: "http://localhost:5037/api/assets",
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          ondata: (formData) => {
            
            formData.append("linkedId", String(linkedId));
            formData.append("linkedType", linkedType);
            return formData;
          },
          onload: (response: any) => {
            queryClient.invalidateQueries({
              queryKey: ["assets", linkedId, linkedType],
            });
            if(linkedType==="Course"){
              queryClient.invalidateQueries({
                queryKey: getCourseAssetQueryKey({
                  path: {
                    courseId: linkedId,
                  },
                }),
              });
            }
            onUploaded?.();
            return response;
          },
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
