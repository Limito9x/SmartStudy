namespace SmartStudy.Server.Integrations.Neo4j
{
    public interface IGraphSyncService
    {
        Task SyncStudyPlanScopeAsync(int userId);
        Task<List<int>> SyncCourseScopeAsync(int studyPlanId);
        Task<List<int>> SyncRoutineAndTaskScopeAsync(int courseId);
        Task SyncLogScopeAsync(int taskId);
    }
}