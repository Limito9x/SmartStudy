using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using TaskStatus = SmartStudy.Server.Entities.Enums.TaskStatus;

namespace SmartStudy.Server.Data;

public interface IMeaningfulSeeder
{
    Task SeedAsync();
}
/// <summary>
/// Seed data có ý nghĩa học tập cho demo và phát triển AI.
/// Đọc từ seed-data.json, tạo 1 demo account với lịch sử học tập thực tế.
/// Tách biệt hoàn toàn với DatabaseSeeder (Bogus).
/// </summary>
///



public class MeaningfulSeeder: IMeaningfulSeeder
{
    private const string DemoUserName = "tk_demo";
    private const string DemoPassword = "Demo@123";
    private const string SeedDataPath = "Data/Seeder/seed-data.json";

    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;

    public MeaningfulSeeder(ApplicationDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }
    
    // ── PLAN TEMPLATES ─────────────────────────────────────────────
private async Task SeedPlanTemplatesAsync(User demoUser)
{
    if (await _context.PlanTemplates.AnyAsync()) return;

    var plan = await _context.StudyPlans
        .FirstOrDefaultAsync(p => p.UserId == demoUser.Id);

    var official = new PlanTemplate
    {
        Name = "KTPM HK8 - Năm 4 (Chính thức)",
        Description = "Kế hoạch HK8 ngành KTPM ĐH Cần Thơ. Luận văn + 2 môn chuyên ngành.",
        IsPublic = true,
        Payload = new TemplatePayload
        {
            DurationDays = 105,
            Courses = new List<TemplateCourse>
            {
                new TemplateCourse
                {
                    Name = "Luận văn tốt nghiệp KTPM",
                    Goal = "Bảo vệ đúng hạn, đạt loại Giỏi",
                    TargetScore = 9.0,
                    Routines = new List<TemplateRoutine>
                    {
                        new TemplateRoutine
                        {
                            Name = "Gặp GVHD hàng tuần",
                            Type = TaskType.Meeting,
                            StartDayOffset = 0,
                            EndDayOffset = 105,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Friday,
                                    StartTime = new TimeOnly(13, 30),
                                    Duration = 60,
                                    Location = "Phòng GV"
                                }
                            }
                        },
                        new TemplateRoutine
                        {
                            Name = "Viết luận văn buổi tối",
                            Type = TaskType.SelfStudy,
                            StartDayOffset = 0,
                            EndDayOffset = 105,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Thursday,
                                    StartTime = new TimeOnly(20, 0),
                                    Duration = 120
                                }
                            }
                        }
                    }
                },
                new TemplateCourse
                {
                    Name = "Kiến trúc và Thiết kế Phần mềm",
                    Goal = "Nắm vững design patterns, target 8.0",
                    TargetScore = 8.0,
                    Routines = new List<TemplateRoutine>
                    {
                        new TemplateRoutine
                        {
                            Name = "Lớp học Kiến trúc PM",
                            Type = TaskType.ClassSession,
                            StartDayOffset = 0,
                            EndDayOffset = 105,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Monday,
                                    StartTime = new TimeOnly(7, 30),
                                    Duration = 90,
                                    Location = "B4-301"
                                },
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Wednesday,
                                    StartTime = new TimeOnly(7, 30),
                                    Duration = 90,
                                    Location = "B4-301"
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    var community = new PlanTemplate
    {
        Name = "KTPM HK8 - Luận văn + IELTS (Community)",
        Description = "Vừa làm luận văn vừa luyện IELTS. Tip: sáng tập trung luận văn, tối luyện IELTS.",
        IsPublic = true,
        CreatedById = demoUser.Id,
        SourcePlanId = plan?.Id,
        Payload = new TemplatePayload
        {
            DurationDays = 105,
            Courses = new List<TemplateCourse>
            {
                new TemplateCourse
                {
                    Name = "Luận văn tốt nghiệp KTPM",
                    Goal = "Bảo vệ đúng hạn",
                    TargetScore = 9.0,
                    Routines = new List<TemplateRoutine>
                    {
                        new TemplateRoutine
                        {
                            Name = "Gặp GVHD",
                            Type = TaskType.Meeting,
                            StartDayOffset = 0,
                            EndDayOffset = 105,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Friday,
                                    StartTime = new TimeOnly(13, 30),
                                    Duration = 60
                                }
                            }
                        }
                    }
                },
                new TemplateCourse
                {
                    Name = "IELTS Preparation",
                    Goal = "Đạt 6.5 trước khi ra trường",
                    TargetScore = 6.5,
                    Routines = new List<TemplateRoutine>
                    {
                        new TemplateRoutine
                        {
                            Name = "Luyện Listening sáng sớm",
                            Type = TaskType.SelfStudy,
                            StartDayOffset = 0,
                            EndDayOffset = 105,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Tuesday,
                                    StartTime = new TimeOnly(6, 30),
                                    Duration = 45
                                },
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Thursday,
                                    StartTime = new TimeOnly(6, 30),
                                    Duration = 45
                                }
                            }
                        },
                        new TemplateRoutine
                        {
                            Name = "Luyện Writing cuối tuần",
                            Type = TaskType.SelfStudy,
                            StartDayOffset = 0,
                            EndDayOffset = 105,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Saturday,
                                    StartTime = new TimeOnly(9, 0),
                                    Duration = 60
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    await _context.PlanTemplates.AddRangeAsync(official, community);
    await _context.SaveChangesAsync();
}

    public async Task SeedAsync()
    {
        // Idempotent — chạy nhiều lần không duplicate
        if (await _userManager.FindByNameAsync(DemoUserName) != null) return;

        var seedData = await LoadSeedDataAsync();
        if (seedData is null) throw new FileNotFoundException($"Không tìm thấy {SeedDataPath}");

        var user = await CreateDemoUserAsync();
        var plan = await CreateStudyPlanAsync(user.Id, seedData.StudyPlan);

        foreach (var courseData in seedData.Courses)
        {
            await CreateCourseWithDataAsync(user, plan, courseData);
        }
        
        await SeedPlanTemplatesAsync(user);
    }

    // ── LOAD JSON ──────────────────────────────────────────────────
    private static async Task<SeedDataDto?> LoadSeedDataAsync()
    {
        if (!File.Exists(SeedDataPath)) return null;
        var json = await File.ReadAllTextAsync(SeedDataPath);
        return JsonSerializer.Deserialize<SeedDataDto>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    // ── USER ───────────────────────────────────────────────────────
    private async Task<User> CreateDemoUserAsync()
    {
        var user = new User
        {
            UserName = DemoUserName,
            Email = "demo@smartstudy.app",
            FullName = "Nguyễn Văn Demo",
            EmailConfirmed = true,
            StudentInfo = new StudentInfo
            {
                University = "Đại học Cần Thơ",
                Major = "KTPM",
                Cohort = "K48"
            }
        };

        var result = await _userManager.CreateAsync(user, DemoPassword);
        if (!result.Succeeded)
            throw new Exception($"Tạo demo user thất bại: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        await _userManager.AddToRoleAsync(user, "Student");
        return user;
    }

    // ── STUDY PLAN ─────────────────────────────────────────────────
    private async Task<StudyPlan> CreateStudyPlanAsync(int userId, StudyPlanDto dto)
    {
        var plan = new StudyPlan
        {
            Name = dto.Name,
            UserId = userId,
            Order = 1,
            Status = StudyPlanStatus.Active,
            StartDate = DateTime.Parse(dto.StartDate).ToUniversalTime(),
            EndDate = DateTime.Parse(dto.EndDate).ToUniversalTime(),
        };

        await _context.StudyPlans.AddAsync(plan);
        await _context.SaveChangesAsync();
        return plan;
    }

    // ── COURSE + ROUTINES + TASKS + LOGS ──────────────────────────
    private async Task CreateCourseWithDataAsync(User user, StudyPlan plan, CourseDto courseDto)
    {
        // 1. Course
        var course = new Course
        {
            Name = courseDto.Name,
            Goal = courseDto.Goal,
            Color = courseDto.Color,
            TargetScore = courseDto.TargetScore,
            Status = Enum.Parse<CourseStatus>(courseDto.Status),
            StudyPlanId = plan.Id,
        };

        await _context.Courses.AddAsync(course);
        await _context.SaveChangesAsync();

        // 2. Routines + Schedules
        var routineMap = new Dictionary<string, Routine>(); // referenceId → Routine

        foreach (var routineDto in courseDto.Routines)
        {
            var routine = new Routine
            {
                Name = routineDto.Name,
                Type = Enum.Parse<TaskType>(routineDto.Type),
                Instructor = routineDto.Instructor,
                UserId = user.Id,
                User = user,
                StudyPlanId = plan.Id,
                CourseId = course.Id,
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                NextOccurrence = DateTime.UtcNow,
            };

            if (routineDto.Schedule is not null)
            {
                routine.Schedules.Add(new Schedule
                {
                    DayOfWeek = Enum.Parse<DayOfWeek>(routineDto.Schedule.DayOfWeek),
                    StartTime = TimeOnly.Parse(routineDto.Schedule.StartTime),
                    Duration = routineDto.Schedule.Duration,
                    Location = routineDto.Schedule.Location,
                });
            }

            await _context.Routines.AddAsync(routine);
            await _context.SaveChangesAsync();

            routineMap[routineDto.ReferenceId] = routine;
        }

        // 3. Tasks + Logs từ weeks data
        var today = DateTime.UtcNow.AddHours(7).Date;

        foreach (var week in courseDto.Weeks)
        {
            foreach (var taskDto in week.Tasks)
            {
                var taskDate = DateOnly.FromDateTime(today.AddDays(taskDto.DayOffset));
                var startTime = TimeOnly.Parse(taskDto.StartTime);

                // Tìm routine + schedule nếu có
                Routine? routine = taskDto.RoutineRef is not null
                    ? routineMap.GetValueOrDefault(taskDto.RoutineRef)
                    : null;

                Schedule? schedule = routine?.Schedules.FirstOrDefault();

                var task = new TaskItem
                {
                    Name = taskDto.Name,
                    Type = Enum.Parse<TaskType>(taskDto.Type),
                    TaskDate = taskDate,
                    StartTime = startTime,
                    PlannedDuration = taskDto.PlannedDuration,
                    Status = Enum.Parse<TaskStatus>(taskDto.Status),
                    UserId = user.Id,
                    StudyPlanId = plan.Id,
                    CourseId = course.Id,
                    RoutineId = routine?.Id,
                    ScheduleId = schedule?.Id,
                };

                await _context.Tasks.AddAsync(task);
                await _context.SaveChangesAsync();

                // 4. Log nếu có
                if (taskDto.Log is not null && taskDto.Status == "Completed")
                {
                    var completedAt = taskDate.ToDateTime(startTime)
                        .AddMinutes(taskDto.Log.ActualDuration)
                        .ToUniversalTime();

                    var log = new LogItem
                    {
                        TaskId = task.Id,
                        Task = task,
                        ActualDuration = taskDto.Log.ActualDuration,
                        ComprehensionLevel = Enum.Parse<ComprehensionLevel>(taskDto.Log.ComprehensionLevel),
                        DifficultyLevel = Enum.Parse<DifficultyLevel>(taskDto.Log.DifficultyLevel),
                        Note = taskDto.Log.Note,
                        CompletedAt = completedAt,
                    };

                    await _context.Logs.AddAsync(log);
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}

// ── DTOs để deserialize JSON ───────────────────────────────────────
internal record SeedDataDto(
    StudyPlanDto StudyPlan,
    List<CourseDto> Courses
);

internal record StudyPlanDto(
    string Name,
    string StartDate,
    string EndDate
);

internal record CourseDto(
    string Name,
    string Goal,
    string Status,
    string? Color,
    double? TargetScore,
    string? Comment,
    List<RoutineDto> Routines,
    List<WeekDto> Weeks
);

internal record RoutineDto(
    string ReferenceId,
    string Name,
    string Type,
    string? Instructor,
    SeedScheduleDto? Schedule
);

internal record SeedScheduleDto(
    string DayOfWeek,
    string StartTime,
    int Duration,
    string? Location
);

internal record WeekDto(
    string WeekName,
    List<TaskDto> Tasks
);

internal record TaskDto(
    string Name,
    string Type,
    string? RoutineRef,
    int DayOffset,
    string StartTime,
    int PlannedDuration,
    string Status,
    SeedLogDto? Log
);

internal record SeedLogDto(
    int ActualDuration,
    string ComprehensionLevel,
    string DifficultyLevel,
    string? Note
);