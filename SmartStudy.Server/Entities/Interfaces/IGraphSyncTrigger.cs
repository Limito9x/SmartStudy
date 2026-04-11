using SmartStudy.Server.Jobs;

public interface IGraphSyncTrigger
{
    // Bảng này thuộc nhóm đồng bộ nào?
    GraphSyncScopeType GetSyncScope();
    
    // ID của thằng (Root) để truyền vào Hangfire là gì?
    int? GetRootId(); 
}