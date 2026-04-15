using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Entities.Interfaces;
using SmartStudy.Server.Jobs;

namespace SmartStudy.Server.Entities
{
    public class AssetLink: BaseEntity, IGraphSyncTrigger
    {
        public required int AssetId { get; set; }
        public Asset? Asset { get; set; }
        public int LinkedId { get; set; }
        public AssetLinkType LinkedType { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }

        public GraphSyncEntityType GetGraphSyncEntityType()
        {
            return GraphSyncEntityType.AssetLink;
        }
    }
}
