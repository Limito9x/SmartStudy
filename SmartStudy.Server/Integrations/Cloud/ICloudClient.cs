using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Integrations.Cloud
{
    public interface ICloudClient
    {
        public Task<CloudinaryDto> UploadFileAsync(IFormFile file);
        public Task DeleteFileAsync(string publicId, FileType fileType);
    }
}
