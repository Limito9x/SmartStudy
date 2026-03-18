using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities;

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

    public DevController(
        ApplicationDbContext context,
        UserManager<User> userManager,
        IWebHostEnvironment env,
        IDatabaseSeeder seeder)
    {
        _context = context;
        _userManager = userManager;
        _env = env;
        _seeder = seeder;
    }

    // POST /api/dev/seed — chạy seeder nếu chưa có data
    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        if (!_env.IsDevelopment())
            return Forbid(); // Chặn tuyệt đối trên Production

        await _seeder.SeedAsync();
        return Ok(new { message = "Seeded successfully" });
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