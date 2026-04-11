namespace SmartStudy.Server.Integrations.Neo4j
{
    public interface IGraphSyncService
    {
        Task SyncStudyPlanScopeAsync(int userId);
        Task SyncCourseScopeAsync(int studyPlanId);
        Task SyncRoutineAndTaskScopeAsync(int courseId);
        Task SyncLogScopeAsync(int taskId);
    }
}