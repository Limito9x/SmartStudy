using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Services
{
    public interface ICloudService
    {
        public Task<CloudinaryDto> UploadFileAsync(IFormFile file);
        public Task DeleteFileAsync(string publicId, FileType fileType);
    }
}
