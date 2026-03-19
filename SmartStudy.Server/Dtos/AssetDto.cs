using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record UploadAssetDto
    (
        List<IFormFile> Files,
        int LinkedId,
        AssetLinkType LinkedType,
        AssetLinkCategory Category = AssetLinkCategory.Reference,
        string? FormFieldKey = null
    );

    public record AssetResponseDto
    (
        int Id,
        string FileName,
        string PublicId,
        string Url,
        string Extension,
        long FileSize,
        FileType Type,
        DateTime CreatedAt,
        AssetLinkType LinkedType,
        AssetLinkCategory Category,
        string? FormFieldKey
    );
    
    public class CourseAssetResponseDto 
    {
    public int Id { get; set; }
    public string FileName { get; set; }
    public string Url { get; set; }
    public FileType Type { get; set; }
    public DateTime CreatedAt { get; set; }
    public AssetLinkType LinkedType { get; set; }
    public string SourceName { get; set; }
    }

    public record RequestQueryAssetDto
    (
        int LinkedId,
        AssetLinkType LinkedType
    );
}
