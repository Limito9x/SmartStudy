import { useState } from "react";

export interface PreviewAsset {
  url: string;
  fileName: string;
}

export function useAssetPreview() {
  const [previewAsset, setPreviewAsset] = useState<PreviewAsset | null>(null);

  const openPreview = (asset: PreviewAsset) => {
    setPreviewAsset(asset);
  };

  const closePreview = () => {
    setPreviewAsset(null);
  };

  return {
    previewAsset,
    openPreview,
    closePreview,
  };
}
