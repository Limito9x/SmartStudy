import AssetUploader from "@/components/files/AssetUploader";
import AssetViewer from "@/components/files/AssetViewer";

export default function AssetsTab({ courseId }: { courseId: number }) {
  return (
    <div className="space-y-4">
      <AssetViewer linkedId={courseId} linkedType="Course" />
      <AssetUploader linkedId={courseId} linkedType="Course" />
    </div>
  );
}
