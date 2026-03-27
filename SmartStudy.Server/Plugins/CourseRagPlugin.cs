using System.ComponentModel;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Services;
using SmartStudy.Server.Services.AI;

namespace SmartStudy.Server.Plugins;

public class CourseRagPlugin
{
    private readonly ApplicationDbContext _context;
    private readonly IEmbeddingService _embeddingService;
    private readonly int _courseId;
    private readonly int _userId;
    
    public CourseRagPlugin(ApplicationDbContext context,
        IEmbeddingService embeddingService,
        int courseId,
        int userId)
    {
        _context = context;
        _embeddingService = embeddingService;
        _courseId = courseId;
        _userId = userId;
    }
    
    [KernelFunction("search_course_documents")]
    [Description("Tìm kiếm thông tin từ tài liệu của khóa học để trả lời câu hỏi của sinh viên. Luôn dùng hàm này khi câu hỏi liên quan đến nội dung, quy định, hoặc bài tập của môn học.")]
    public async Task<string> SearchCourseDocuments(
        [Description("Câu hỏi hoặc từ khóa cần tìm kiếm trong tài liệu")] string query)
    {
        Console.WriteLine($"[RAG Plugin] Đang tìm kiếm vector cho câu: {query}");

        // 1. Nhúng câu query
        var queryVectorArray = await _embeddingService.GenerateEmbeddingAsync(query);
        var queryVector = new Vector(queryVectorArray);

        var userId = _userId;
        
        var taskIds = await _context.Tasks
            .Where(t => t.CourseId == _courseId && t.UserId == userId)
            .Select(t => t.Id)
            .ToListAsync();
        
        var logIds = await _context.Logs
            .Where(l => taskIds.Contains(l.TaskId))
            .Select(l => l.Id).ToListAsync();
        
        

        // 2. Lấy danh sách AssetId của khóa học
        var allRelatedAssetIds = await _context.AssetLinks
            .Where(al => al.LinkedType == AssetLinkType.Course && al.LinkedId == _courseId || 
                         al.LinkedType == AssetLinkType.Task && taskIds.Contains(al.LinkedId) ||
                         al.LinkedType == AssetLinkType.Log && logIds.Contains(al.LinkedId))
            .Select(al => al.AssetId)
            .Distinct()
            .ToListAsync();

        if (!allRelatedAssetIds.Any()) return "Khóa học này chưa có tài liệu nào.";

        // 3. Vector Search
        var topChunks = await _context.DocumentChunks
            .Where(c => allRelatedAssetIds.Contains(c.AssetId))
            .OrderBy(c => c.Embedding.CosineDistance(queryVector))
            .Take(5)
            .Select(c => c.TextContent)
            .ToListAsync();

        return string.Join("\n\n---\n\n", topChunks);
    }
}