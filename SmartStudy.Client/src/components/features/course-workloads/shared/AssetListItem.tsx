import AssetItem from "@/components/files/AssetItem";
import type { AssetResponseDto } from "@/services/api";

interface AssetListItemProps {
  asset: AssetResponseDto;
  onPreview?: (asset: { url: string; fileName: string }) => void;
}

export default function AssetListItem({
  asset,
  onPreview,
}: AssetListItemProps) {
  return <AssetItem asset={asset} compact onPreview={onPreview} />;
}
