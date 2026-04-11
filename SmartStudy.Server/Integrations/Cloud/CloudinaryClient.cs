using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;

public class CloudinaryGroupResult
{
    public List<string> PublicIds { get; set; } = new List<string>();
    public FileType FileType { get; set; }
}

namespace SmartStudy.Server.Integrations.Cloud
{
    public class CloudinaryClient : ICloudClient
    {
        private readonly Cloudinary _cloudinary;
        private readonly string baseFolder = "SmartStudy";

        public CloudinaryClient(IConfiguration config)
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

        public async Task DeleteFileAsync(string publicId, FileType fileType)
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

        public async Task DeleteFilesAsync(IEnumerable<string> publicIds, FileType fileType)
        {
            var resourceType = fileType switch
            {
                FileType.Image => ResourceType.Image,
                FileType.Video => ResourceType.Video,
                FileType.Audio => ResourceType.Video,
                _ => ResourceType.Raw
            };
            var deletionParams = new DelResParams()
            {
                PublicIds = publicIds.ToList(),
                ResourceType = resourceType
            };
            await _cloudinary.DeleteResourcesAsync(deletionParams);
        }

        public async Task<List<CloudinaryGroupResult>> GetPublicIdsByFolder()
        {
            var groups = new List<CloudinaryGroupResult>();
            var folders = new[] { "images", "videos", "docs" };
            string? nextCursor = null;

            foreach (var folder in folders)
            {
                do
                {
                    var search = _cloudinary.Search()
                        .Expression($"folder:{baseFolder}/{folder}/*")
                        .MaxResults(500);
  
                    if (!string.IsNullOrEmpty(nextCursor))                    {
                        search = search.NextCursor(nextCursor);
                    }

                    var group = new CloudinaryGroupResult
                    {
                        FileType = folder switch
                        {
                            "images" => FileType.Image,
                            "videos" => FileType.Video,
                            "docs" => FileType.Other,
                            _ => FileType.Other
                        }
                    };

                    var result = await search.ExecuteAsync();
                    var publicIds = result.Resources.Select(r => r.PublicId).ToList();
                    group.PublicIds.AddRange(publicIds);
                    groups.Add(group);
                } while (!string.IsNullOrEmpty(nextCursor));
            }

            return groups;
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
