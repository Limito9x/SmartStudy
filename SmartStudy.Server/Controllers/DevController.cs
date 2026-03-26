using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Services;
using SmartStudy.Server.Services.AI;

namespace SmartStudy.Server.Controllers;

[ApiController]
[Route("api/dev")]
[AllowAnonymous]
public class DevController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IWebHostEnvironment _env;
    private readonly IDatabaseSeeder _seeder;
    private readonly IMeaningfulSeeder _meaningfulSeeder;
    private readonly IAssetService _assetService;
    private readonly ILlamaParseService _parser;
    private readonly IDocumentChunkService _chunkService;
    private readonly IEmbeddingService _embeddingService;

    public DevController(
        ApplicationDbContext context,
        UserManager<User> userManager,
        IWebHostEnvironment env,
        IDatabaseSeeder seeder,
        IMeaningfulSeeder meaningfulSeeder,
        IAssetService assetService,
        ILlamaParseService parser,
        IDocumentChunkService chunkService,
        IEmbeddingService embeddingService)
    {
        _context = context;
        _userManager = userManager;
        _env = env;
        _seeder = seeder;
        _meaningfulSeeder = meaningfulSeeder;
        _assetService = assetService;
        _parser = parser;
        _chunkService = chunkService;
        _embeddingService = embeddingService;
    }

    // POST /api/dev/seed — chạy seeder nếu chưa có data
    [HttpPost("seed-bogus")]
    public async Task<IActionResult> Seed()
    {
        if (!_env.IsDevelopment())
            return Forbid(); // Chặn tuyệt đối trên Production

        await _seeder.SeedAsync();
        return Ok(new { message = "Seeded successfully" });
    }
    
    [HttpPost("seed-meaningful")]
    public async Task<IActionResult> SeedMeaningful()
    {
        if (!_env.IsDevelopment())
            return Forbid(); // Chặn tuyệt đối trên Production

        await _meaningfulSeeder.SeedAsync();
        return Ok(new { message = "Meaningful data seeded successfully" });
    }
    

    // POST /api/dev/reset — xóa sạch rồi seed lại
    [HttpPost("reset")]
    public async Task<IActionResult> Reset()
    {
        if (!_env.IsDevelopment())
            return Forbid();

        await HardResetAsync();
        await _seeder.SeedAsync();
        return Ok(new { message = "Reset and reseeded successfully" });
    }

    [HttpPost("trigger-garbage-collector")]
    public async Task<IActionResult> TriggerGarbageCollector()
    {
        if (!_env.IsDevelopment()) 
            return Forbid();

        var count = await _assetService.CleanupSoftDeletedAssetsAsync();
        return Ok(new { Message = $"Đã dọn dẹp thành công {count} file rác khỏi hệ thống." });
    }
    
    [HttpPost("test-llamaparse")]
    public async Task<IActionResult> TestLlamaParse(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Chưa chọn file!");

        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Tạm thời test PDF!");

        try
        {
            // Mở luồng đọc trực tiếp từ RAM, không cần lưu xuống ổ cứng
            using var stream = file.OpenReadStream();
                
            // Gọi con LlamaParse đi làm việc
            var markdown = await _parser.ParseDocumentToMarkdownAsync(stream, file.FileName);

            var chunks = _chunkService.SplitMarkdownIntoChunks(markdown);
            
            var firstChunk = chunks.First();
            var firstEmbedding = await _embeddingService.GenerateEmbeddingAsync(firstChunk);

            return Ok(new
            {
                TotalChunks = chunks.Count,
                FirstChunk = firstChunk,
                EmbeddingLength = firstEmbedding.Length,
                SampleVector = firstEmbedding.Take(5)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpPost("full-RAG-pipeline-test")]
    public async Task<IActionResult> FullRagPipelineTest(IFormFile file, [FromQuery] int assetId)
    {
        try
        {
            // 1. Đọc file
            using var stream = file.OpenReadStream();
        
            // 2. LlamaParse bóc text
            var markdown = await _parser.ParseDocumentToMarkdownAsync(stream, file.FileName);
        
            // 3. Máy xay thịt băm chunk
            var chunks = _chunkService.SplitMarkdownIntoChunks(markdown);

            if (chunks.Count == 0) return BadRequest("File rỗng!");

            // 4. Nhúng Vector và cắm xuống DB (CÚ CHỐT)
            await _chunkService.SaveChunksToDatabaseAsync(assetId, chunks);

            return Ok($"Tuyệt vời! Đã băm và cắm thành công {chunks.Count} chunks có chứa Vector vào Database cho Asset {assetId}.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Toang rồi bác: {ex.Message}");
        }
    }

    private async Task HardResetAsync()
    {
        // Xóa theo đúng thứ tự ngược dependency
        _context.Logs.RemoveRange(_context.Logs);
        _context.Tasks.RemoveRange(_context.Tasks);
        _context.Schedules.RemoveRange(_context.Schedules);
        _context.Routines.RemoveRange(_context.Routines);
        _context.TimelineEvents.RemoveRange(_context.TimelineEvents);
        _context.Courses.RemoveRange(_context.Courses);
        _context.StudyPlans.RemoveRange(_context.StudyPlans);
        _context.ChatMessages.RemoveRange(_context.ChatMessages);
        _context.ChatSessions.RemoveRange(_context.ChatSessions);
        _context.StudentInfos.RemoveRange(_context.StudentInfos);

        // Xóa user demo (không xóa toàn bộ user tránh mất role/admin)
        var demoUser = await _userManager.FindByEmailAsync("thuan@smartstudy.dev");
        if (demoUser != null)
            await _userManager.DeleteAsync(demoUser);

        await _context.SaveChangesAsync();
    }
}