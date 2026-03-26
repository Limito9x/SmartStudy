using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Entities
{
    public class AssetLink: BaseEntity
    {
        public required int AssetId { get; set; }
        public Asset? Asset { get; set; }
        public int LinkedId { get; set; }
        public AssetLinkType LinkedType { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
