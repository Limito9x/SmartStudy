using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Dtos
{
    public record UploadAssetDto
    (
        List<IFormFile> Files,
        int LinkedId,
        AssetLinkType LinkedType,
        AssetLinkCategory Category,
        string? FormFieldKey
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

    public record RequestQueryAssetDto
    (
        int LinkedId,
        AssetLinkType LinkedType
    );
}
