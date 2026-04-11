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
        private readonly IAiApiClient _aiApiClient;

        public GraphSyncBackgroundJob(IGraphSyncService graphSyncService,
         IAiApiClient aiApiClient)
        {
            _graphSyncService = graphSyncService;
            _aiApiClient = aiApiClient;
        }

        public async Task ExecuteSyncAsync(GraphSyncScopeType scopeType, int entityId)
        {
            switch (scopeType)
            {
                case GraphSyncScopeType.UserStudyPlans:
                    await _graphSyncService.SyncStudyPlanScopeAsync(entityId);
                    break;

                case GraphSyncScopeType.StudyPlanCourses:
                    var courseIds = await _graphSyncService.SyncCourseScopeAsync(entityId);
                    await _aiApiClient.EmbeddingGraph("Course", courseIds);
                    break;

                case GraphSyncScopeType.CourseRoutinesAndTasks:
                    var taskIds = await _graphSyncService.SyncRoutineAndTaskScopeAsync(entityId);
                    await _aiApiClient.EmbeddingGraph("Task", taskIds);
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