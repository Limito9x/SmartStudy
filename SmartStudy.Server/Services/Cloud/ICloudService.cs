using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Services.Cloud
{
    public interface ICloudService
    {
        public Task<CloudinaryDto> UploadFileAsync(IFormFile file);
        public System.Threading.Tasks.Task DeleteFileAsync(string publicId, FileType fileType);
    }
}
