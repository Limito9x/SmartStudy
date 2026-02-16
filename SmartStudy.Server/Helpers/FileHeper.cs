using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Helpers
{
    public static class FileHelper
    {
        public static FileType GetFileType(string fileName)
        {
            if (string.IsNullOrEmpty(fileName)) return FileType.Other;

            // Lấy đuôi file và chuyển về chữ thường (ví dụ: .JPG -> .jpg)
            var extension = Path.GetExtension(fileName).ToLower();

            // 1. Danh sách Ảnh
            var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".ico" };
            if (imageExtensions.Contains(extension)) return FileType.Image;

            // 2. Danh sách Video
            var videoExtensions = new[] { ".mp4", ".mov", ".avi", ".wmv", ".flv", ".webm", ".mkv" };
            if (videoExtensions.Contains(extension)) return FileType.Video;

            // 3. Danh sách Âm thanh
            var audioExtensions = new[] { ".mp3", ".wav", ".wma", ".aac", ".ogg", ".m4a" };
            if (audioExtensions.Contains(extension)) return FileType.Audio;

            // 4. Danh sách Tài liệu
            var documentExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv" };
            if (documentExtensions.Contains(extension)) return FileType.Document;

            // Không thuộc loại nào ở trên
            return FileType.Other;
        }
    }
}
