using SmartStudy.Server.Jobs;
using SmartStudy.Server.Entities.Interfaces;

public interface IGraphSyncTrigger : IHasId
{
    // Entity type used by background job router.
    GraphSyncEntityType GetGraphSyncEntityType();
}