import React from "react";

interface AssetViewerProps {
  url: string; // VD: https://res.cloudinary.com/.../file.docx
  fileName: string; // VD: bai_tap.docx
}

const AssetViewer: React.FC<AssetViewerProps> = ({ url, fileName }) => {
  // 1. Lấy đuôi file để biết nó là loại gì
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  // 2. XỬ LÝ ẢNH (Dùng thẻ img cơ bản)
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-gray-50 rounded-lg">
        <img
          src={url}
          alt={fileName}
          className="max-w-full max-h-[600px] object-contain rounded shadow"
        />
      </div>
    );
  }

  // 3. XỬ LÝ PDF (Dùng iframe thuần của HTML)
  if (extension === "pdf") {
    return (
      <iframe
        src={url}
        className="w-full h-[600px] border border-gray-200 rounded-lg shadow-sm"
        title={fileName}
      />
    );
  }

  // 4. XỬ LÝ WORD, EXCEL, PPT (Dùng Microsoft Office Viewer)
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension)) {
    // Phải mã hóa cái URL Cloudinary thì Microsoft mới hiểu
    const encodedUrl = encodeURIComponent(url);
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

    return (
      <iframe
        src={officeUrl}
        className="w-full h-[600px] border border-gray-200 rounded-lg shadow-sm"
        title={fileName}
      />
    );
  }

  // 5. CÁC FILE KHÔNG THỂ XEM TRỰC TIẾP (Zip, Rar, Exe...)
  return (
    <div className="w-full h-[300px] flex flex-col justify-center items-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-4xl mb-3">📁</div>
      <p className="text-gray-600 mb-4 text-center">
        Định dạng <b>.{extension}</b> không hỗ trợ xem trực tiếp trên web.
        <br />
        Vui lòng tải xuống để xem.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
      >
        Tải tài liệu xuống
      </a>
    </div>
  );
};

export default AssetViewer;
