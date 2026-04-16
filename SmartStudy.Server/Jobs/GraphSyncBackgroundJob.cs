using Hangfire;
using SmartStudy.Server.Integrations.Neo4j;

namespace SmartStudy.Server.Jobs
{
    public enum GraphSyncEntityType
    {
        User = 0,
        StudyPlan = 1,
        Course = 2,
        Phase = 3,
        Routine = 4,
        Task = 5,
        Log = 6,
        Schedule = 7,
        Asset = 8,
        AssetLink = 9
    }

    public enum GraphSyncChangeType
    {
        Added = 0,
        Modified = 1,
        Deleted = 2
    }

    public interface IGraphSyncBackgroundJob
    {
        Task ExecuteSyncAsync(GraphSyncEntityType entityType, int entityId, GraphSyncChangeType changeType);
    }

    [AutomaticRetry(Attempts = 3)]
    public class GraphSyncBackgroundJob : IGraphSyncBackgroundJob
    {
        private readonly IGraphSyncService _graphSyncService;

        public GraphSyncBackgroundJob(IGraphSyncService graphSyncService)
        {
            _graphSyncService = graphSyncService;
        }

        public async Task ExecuteSyncAsync(GraphSyncEntityType entityType, int entityId, GraphSyncChangeType changeType)
        {
            if (changeType == GraphSyncChangeType.Deleted)
            {
                switch (entityType)
                {
                    case GraphSyncEntityType.User:
                        await _graphSyncService.DeleteUserAsync(entityId);
                        break;
                    case GraphSyncEntityType.StudyPlan:
                        await _graphSyncService.DeleteStudyPlanAsync(entityId);
                        break;
                    case GraphSyncEntityType.Course:
                        await _graphSyncService.DeleteCourseAsync(entityId);
                        break;
                    case GraphSyncEntityType.Phase:
                        await _graphSyncService.DeletePhaseAsync(entityId);
                        break;
                    case GraphSyncEntityType.Routine:
                        await _graphSyncService.DeleteRoutineAsync(entityId);
                        break;
                    case GraphSyncEntityType.Task:
                        await _graphSyncService.DeleteTaskAsync(entityId);
                        break;
                    case GraphSyncEntityType.Log:
                        await _graphSyncService.DeleteLogAsync(entityId);
                        break;
                    case GraphSyncEntityType.Schedule:
                        await _graphSyncService.DeleteScheduleAsync(entityId);
                        break;
                    case GraphSyncEntityType.Asset:
                        await _graphSyncService.DeleteAssetAsync(entityId);
                        break;
                    case GraphSyncEntityType.AssetLink:
                        await _graphSyncService.DeleteAssetLinkAsync(entityId);
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(entityType), entityType, "Unsupported graph sync entity type.");
                }

                return;
            }

            switch (entityType)
            {
                case GraphSyncEntityType.User:
                    await _graphSyncService.SyncUserAsync(entityId);
                    break;
                case GraphSyncEntityType.StudyPlan:
                    await _graphSyncService.SyncStudyPlanAsync(entityId);
                    break;
                case GraphSyncEntityType.Course:
                    await _graphSyncService.SyncCourseAsync(entityId);
                    break;
                case GraphSyncEntityType.Phase:
                    await _graphSyncService.SyncPhaseAsync(entityId);
                    break;
                case GraphSyncEntityType.Routine:
                    await _graphSyncService.SyncRoutineAsync(entityId);
                    break;
                case GraphSyncEntityType.Task:
                    await _graphSyncService.SyncTaskAsync(entityId);
                    break;
                case GraphSyncEntityType.Log:
                    await _graphSyncService.SyncLogAsync(entityId);
                    break;
                case GraphSyncEntityType.Schedule:
                    await _graphSyncService.SyncScheduleAsync(entityId);
                    break;
                case GraphSyncEntityType.Asset:
                    await _graphSyncService.SyncAssetAsync(entityId);
                    break;
                case GraphSyncEntityType.AssetLink:
                    await _graphSyncService.SyncAssetLinkAsync(entityId);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(entityType), entityType, "Unsupported graph sync entity type.");
            }
        }
    }
}