using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Services;

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

    public DevController(
        ApplicationDbContext context,
        UserManager<User> userManager,
        IWebHostEnvironment env,
        IDatabaseSeeder seeder,
        IMeaningfulSeeder meaningfulSeeder)
    {
        _context = context;
        _userManager = userManager;
        _env = env;
        _seeder = seeder;
        _meaningfulSeeder = meaningfulSeeder;
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

    // POST /api/dev/seed-meaningful-isolated?runTag=thesis1&overwrite=true
    // Tạo dataset meaningful riêng cho sandbox user, không reset DB tổng.
    [HttpPost("seed-meaningful-isolated")]
    public async Task<IActionResult> SeedMeaningfulIsolated([FromQuery] string runTag = "thesis", [FromQuery] bool overwrite = false)
    {
        if (!_env.IsDevelopment())
            return Forbid();

        var result = await _meaningfulSeeder.SeedIsolatedAsync(runTag, overwrite);
        return Ok(result);
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