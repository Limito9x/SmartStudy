using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Entities.Interfaces;
using SmartStudy.Server.Jobs;

namespace SmartStudy.Server.Entities
{
    public class Asset: BaseEntity, IGraphSyncTrigger
    {
        public string FileName { get; set; }
        public string PublicId { get; set; }
        public string Url { get; set; }
        public FileType Type { get; set; }
        public string Extension { get; set; }
        public long FileSize { get; set; }
        public AssetStatus Status { get; set; } = AssetStatus.Uploaded;
        public ICollection<AssetLink> AssetLinks { get; set; } = new List<AssetLink>();
        public int UserId { get; set; }
        public User? User { get; set; }

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.Asset;
        }
    }
}
