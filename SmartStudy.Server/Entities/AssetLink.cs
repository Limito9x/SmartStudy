using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class AssetLink: BaseSimpleEntity
    {
        public required int AssetId { get; set; }
        public Asset? Asset { get; set; }
        public int LinkedId { get; set; }
        public AssetLinkType LinkedType { get; set; }
        public AssetLinkCategory Category { get; set; } = AssetLinkCategory.Reference;
        public string? FormFieldKey { get; set; } // Nếu liên kết này xuất phát từ một trường trong Form thì lưu trữ Id của trường đó
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
