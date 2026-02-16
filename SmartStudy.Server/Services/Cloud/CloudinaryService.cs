using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Services.Cloud
{
    public class CloudinaryService : ICloudService
    {
        private readonly Cloudinary _cloudinary;
        private readonly string baseFolder = "Semester Management Project";

        public CloudinaryService(IConfiguration config)
        {
            var account = new Account
            (
                config["Cloudinary:CloudName"],
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );

            _cloudinary = new Cloudinary(account);
        }
        // Helper giúp xác định loại file dựa trên phần mở rộng
        private bool IsImage(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLower();
            return new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp" }.Contains(ext);
        }

        private bool IsVideo(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLower();
            return new[] { ".mp4", ".mov", ".avi", ".webm" }.Contains(ext);
        }

        public async System.Threading.Tasks.Task DeleteFileAsync(string publicId, FileType fileType)
        {
            var resourceType = fileType switch
            {
                FileType.Image => ResourceType.Image,
                FileType.Video => ResourceType.Video,
                FileType.Audio => ResourceType.Video,
                _ => ResourceType.Raw
            };
            var deletionParams = new DeletionParams(publicId)
            {
                ResourceType = resourceType
            };
            await _cloudinary.DestroyAsync(deletionParams);
        }

        public async Task<CloudinaryDto> UploadFileAsync(IFormFile file)
        {
            if (file.Length == 0)
            {
                throw new ArgumentException("File is empty");
            }

            // Đặt trường hợp mặc định là "others"
            var uploadResult = new RawUploadResult();

            using (var stream = file.OpenReadStream())
            {
                var fileName = file.FileName;
                if (IsImage(fileName))
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(fileName, stream),
                        Folder = new string($"{baseFolder}/images")
                    };
                    uploadResult = await _cloudinary.UploadAsync(uploadParams);

                }
                else if (IsVideo(fileName))
                {
                    var uploadParams = new VideoUploadParams()
                    {
                        File = new FileDescription(fileName, stream),
                        Folder = new string($"{baseFolder}/videos")
                    };
                    uploadResult = await _cloudinary.UploadAsync(uploadParams);
                }
                else
                {
                    var uploadParams = new RawUploadParams()
                    {
                        File = new FileDescription(fileName, stream),
                        Folder = new string($"{baseFolder}/docs")
                    };
                    uploadResult = await _cloudinary.UploadAsync(uploadParams);
                }

                if (uploadResult.Error != null)
                {
                    throw new Exception($"Cloudinary upload error: {uploadResult.Error.Message}");
                }
            }

            return new CloudinaryDto
            {
                PublicId = uploadResult.PublicId,
                Url = uploadResult.SecureUrl.ToString()
            };
        }
    }
}
