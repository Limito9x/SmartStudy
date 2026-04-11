using Hangfire;
using SmartStudy.Server.Integrations.Neo4j;

namespace SmartStudy.Server.Jobs
{
    public enum GraphSyncScopeType
    {
        UserStudyPlans = 0,
        StudyPlanCourses = 1,
        CourseRoutinesAndTasks = 2,
        TaskLogs = 3
    }

    public interface IGraphSyncBackgroundJob
    {
        Task ExecuteSyncAsync(GraphSyncScopeType scopeType, int entityId);
    }

    [AutomaticRetry(Attempts = 3)]
    public class GraphSyncBackgroundJob : IGraphSyncBackgroundJob
    {
        private readonly IGraphSyncService _graphSyncService;

        public GraphSyncBackgroundJob(IGraphSyncService graphSyncService)
        {
            _graphSyncService = graphSyncService;
        }

        public async Task ExecuteSyncAsync(GraphSyncScopeType scopeType, int entityId)
        {
            switch (scopeType)
            {
                case GraphSyncScopeType.UserStudyPlans:
                    await _graphSyncService.SyncStudyPlanScopeAsync(entityId);
                    break;

                case GraphSyncScopeType.StudyPlanCourses:
                    await _graphSyncService.SyncCourseScopeAsync(entityId);
                    break;

                case GraphSyncScopeType.CourseRoutinesAndTasks:
                    await _graphSyncService.SyncRoutineAndTaskScopeAsync(entityId);
                    break;

                case GraphSyncScopeType.TaskLogs:
                    await _graphSyncService.SyncLogScopeAsync(entityId);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(scopeType), scopeType, "Unsupported graph sync scope type.");
            }
        }
    }
}