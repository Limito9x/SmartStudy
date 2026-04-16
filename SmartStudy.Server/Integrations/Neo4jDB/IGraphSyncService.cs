namespace SmartStudy.Server.Integrations.Neo4j
{
    public interface IGraphSyncService
    {
        Task SyncUserAsync(int userId);
        Task SyncStudyPlanAsync(int studyPlanId);
        Task SyncCourseAsync(int courseId);
        Task SyncPhaseAsync(int phaseId);
        Task SyncRoutineAsync(int routineId);
        Task SyncTaskAsync(int taskId);
        Task SyncLogAsync(int logId);
        Task SyncScheduleAsync(int scheduleId);
        Task SyncAssetAsync(int assetId);
        Task SyncAssetLinkAsync(int assetLinkId);

        Task DeleteUserAsync(int userId);
        Task DeleteStudyPlanAsync(int studyPlanId);
        Task DeleteCourseAsync(int courseId);
        Task DeletePhaseAsync(int phaseId);
        Task DeleteRoutineAsync(int routineId);
        Task DeleteTaskAsync(int taskId);
        Task DeleteLogAsync(int logId);
        Task DeleteScheduleAsync(int scheduleId);
        Task DeleteAssetAsync(int assetId);
        Task DeleteAssetLinkAsync(int assetLinkId);
    }
}