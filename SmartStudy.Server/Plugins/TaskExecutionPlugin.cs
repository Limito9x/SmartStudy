using System.ComponentModel;
using System.Text.Json;
using Microsoft.SemanticKernel;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Services;

namespace SmartStudy.Server.Plugins;

public class TaskExecutionPlugin
{
    private readonly ITaskService _taskService;

    public TaskExecutionPlugin(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [KernelFunction("get_task_detail_by_id")]
    [Description("Lay chi tiet task theo id, gom thong tin task, logs va tai lieu lien quan.")]
    public async Task<string> GetTaskDetailByIdAsync(
        [Description("Task id can xem chi tiet")] int taskId)
    {
        var detail = await _taskService.GetTaskDetailByIdAsync(taskId);

        return JsonSerializer.Serialize(detail, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });
    }

    [KernelFunction("update_task_status_by_id")]
    [Description("Cap nhat trang thai task. Chi duoc goi sau khi user xac nhan ro rang.")]
    public async Task<string> UpdateTaskStatusByIdAsync(
        [Description("Task id can cap nhat")] int taskId,
        [Description("Trang thai moi: Pending, InProgress, Completed, Cancelled")] string status,
        [Description("Da co xac nhan cua user hay chua. Phai la true moi duoc cap nhat.")] bool isConfirmed = false)
    {
        if (!isConfirmed)
        {
            return "Chua cap nhat: can xac nhan cua nguoi dung truoc khi thay doi du lieu.";
        }

        if (!Enum.TryParse<SmartStudy.Server.Entities.Enums.TaskStatus>(status, true, out var parsedStatus))
        {
            return "Trang thai khong hop le. Gia tri hop le: Pending, InProgress, Completed, Cancelled.";
        }

        var updated = await _taskService.UpdateTaskStatusAsync(taskId, new TaskStatusDto(parsedStatus));
        return $"Da cap nhat task #{updated.Id} sang trang thai {updated.Status}.";
    }
}


