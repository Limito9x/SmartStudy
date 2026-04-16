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
    Task<IsolatedSeedResult> SeedIsolatedAsync(string runTag, bool overwrite = false);
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
    var plan = await _context.StudyPlans
        .FirstOrDefaultAsync(p => p.UserId == demoUser.Id);

    var legacyTemplates = await _context.PlanTemplates
        .Where(t => t.CreatedById == demoUser.Id
                    && (t.Name.Contains("HK8") || t.Name.Contains("Community")))
        .ToListAsync();

    if (legacyTemplates.Count > 0)
    {
        _context.PlanTemplates.RemoveRange(legacyTemplates);
        await _context.SaveChangesAsync();
    }

    var universityTemplate = new PlanTemplate
    {
        Name = "Đại học - Kỳ học ổn định",
        Description = "Template đại học tập trung 2 môn cốt lõi, nhịp học đều và có buổi ôn cuối tuần.",
        IsPublic = true,
        Type = StudyPlanType.Academic,
        CreatedById = demoUser.Id,
        SourcePlanId = plan?.Id,
        Payload = new TemplatePayload
        {
            DurationDays = 112,
            Courses = new List<TemplateCourse>
            {
                new TemplateCourse
                {
                    Name = "Cấu trúc dữ liệu và giải thuật",
                    Goal = "Nắm chắc nền tảng giải thuật, đạt từ 8.0 trở lên",
                    TargetScore = 8.0,
                    Routines = new List<TemplateRoutine>
                    {
                        new TemplateRoutine
                        {
                            Name = "Buổi học trên lớp",
                            Type = TaskType.ClassSession,
                            StartDayOffset = 0,
                            EndDayOffset = 112,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Monday,
                                    StartTime = new TimeOnly(7, 30),
                                    Duration = 90
                                }
                            }
                        },
                        new TemplateRoutine
                        {
                            Name = "Luyện bài tập thuật toán",
                            Type = TaskType.SelfStudy,
                            StartDayOffset = 0,
                            EndDayOffset = 112,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Wednesday,
                                    StartTime = new TimeOnly(19, 30),
                                    Duration = 90
                                }
                            }
                        }
                    }
                },
                new TemplateCourse
                {
                    Name = "Cơ sở dữ liệu nâng cao",
                    Goal = "Làm chủ thiết kế schema và tối ưu truy vấn",
                    TargetScore = 8.5,
                    Routines = new List<TemplateRoutine>
                    {
                        new TemplateRoutine
                        {
                            Name = "Thực hành SQL có hướng dẫn",
                            Type = TaskType.ClassSession,
                            StartDayOffset = 0,
                            EndDayOffset = 112,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Tuesday,
                                    StartTime = new TimeOnly(13, 30),
                                    Duration = 90
                                },
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Friday,
                                    StartTime = new TimeOnly(13, 30),
                                    Duration = 90
                                }
                            }
                        },
                        new TemplateRoutine
                        {
                            Name = "Ôn tập và làm đề",
                            Type = TaskType.SelfStudy,
                            StartDayOffset = 0,
                            EndDayOffset = 112,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Saturday,
                                    StartTime = new TimeOnly(9, 0),
                                    Duration = 120
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    var personalTemplate = new PlanTemplate
    {
        Name = "Cá nhân - Kỷ luật mỗi ngày",
        Description = "Template cá nhân cho mục tiêu tự học dài hạn: ngoại ngữ, đọc sách và vận động.",
        IsPublic = true,
        Type = StudyPlanType.Personal,
        CreatedById = demoUser.Id,
        SourcePlanId = plan?.Id,
        Payload = new TemplatePayload
        {
            DurationDays = 84,
            Courses = new List<TemplateCourse>
            {
                new TemplateCourse
                {
                    Name = "Tiếng Anh giao tiếp",
                    Goal = "Nâng phản xạ nghe nói, duy trì đều 5 buổi/tuần",
                    TargetScore = 7.0,
                    Routines = new List<TemplateRoutine>
                    {
                        new TemplateRoutine
                        {
                            Name = "Listening buổi sáng",
                            Type = TaskType.SelfStudy,
                            StartDayOffset = 0,
                            EndDayOffset = 84,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Monday,
                                    StartTime = new TimeOnly(6, 30),
                                    Duration = 45
                                },
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Wednesday,
                                    StartTime = new TimeOnly(6, 30),
                                    Duration = 45
                                },
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Friday,
                                    StartTime = new TimeOnly(6, 30),
                                    Duration = 45
                                }
                            }
                        }
                    }
                },
                new TemplateCourse
                {
                    Name = "Rèn thói quen phát triển bản thân",
                    Goal = "Duy trì đọc sách và tập luyện để giữ năng lượng học tập",
                    TargetScore = null,
                    Routines = new List<TemplateRoutine>
                    {
                        new TemplateRoutine
                        {
                            Name = "Đọc sách chuyên môn",
                            Type = TaskType.SelfStudy,
                            StartDayOffset = 0,
                            EndDayOffset = 84,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Tuesday,
                                    StartTime = new TimeOnly(21, 0),
                                    Duration = 30
                                },
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Thursday,
                                    StartTime = new TimeOnly(21, 0),
                                    Duration = 30
                                }
                            }
                        },
                        new TemplateRoutine
                        {
                            Name = "Vận động cuối tuần",
                            Type = TaskType.SelfStudy,
                            StartDayOffset = 0,
                            EndDayOffset = 84,
                            Schedules = new List<TemplateSchedule>
                            {
                                new TemplateSchedule
                                {
                                    DayOfWeek = DayOfWeek.Saturday,
                                    StartTime = new TimeOnly(7, 0),
                                    Duration = 60
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    var existingUniversityTemplate = await _context.PlanTemplates
        .FirstOrDefaultAsync(t => t.CreatedById == demoUser.Id
                                  && t.Type == StudyPlanType.Academic
                                  && t.Name == universityTemplate.Name);

    if (existingUniversityTemplate is null)
    {
        await _context.PlanTemplates.AddAsync(universityTemplate);
    }
    else
    {
        existingUniversityTemplate.Description = universityTemplate.Description;
        existingUniversityTemplate.IsPublic = universityTemplate.IsPublic;
        existingUniversityTemplate.SourcePlanId = universityTemplate.SourcePlanId;
        existingUniversityTemplate.Payload = universityTemplate.Payload;
    }

    var existingPersonalTemplate = await _context.PlanTemplates
        .FirstOrDefaultAsync(t => t.CreatedById == demoUser.Id
                                  && t.Type == StudyPlanType.Personal
                                  && t.Name == personalTemplate.Name);

    if (existingPersonalTemplate is null)
    {
        await _context.PlanTemplates.AddAsync(personalTemplate);
    }
    else
    {
        existingPersonalTemplate.Description = personalTemplate.Description;
        existingPersonalTemplate.IsPublic = personalTemplate.IsPublic;
        existingPersonalTemplate.SourcePlanId = personalTemplate.SourcePlanId;
        existingPersonalTemplate.Payload = personalTemplate.Payload;
    }

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

    public async Task<IsolatedSeedResult> SeedIsolatedAsync(string runTag, bool overwrite = false)
    {
        var normalizedTag = NormalizeRunTag(runTag);
        var sandboxUserName = $"tk_demo_{normalizedTag}";
        var sandboxEmail = $"{sandboxUserName}@smartstudy.dev";

        var seedData = await LoadSeedDataAsync();
        if (seedData is null) throw new FileNotFoundException($"Không tìm thấy {SeedDataPath}");

        var user = await _userManager.FindByNameAsync(sandboxUserName);
        if (user == null)
        {
            user = await CreateDemoUserAsync(sandboxUserName, sandboxEmail, $"Demo Luận văn ({normalizedTag})");
        }
        else if (overwrite)
        {
            await ClearUserDomainDataAsync(user.Id);
        }
        else
        {
            var hasExistingPlan = await _context.StudyPlans.AnyAsync(x => x.UserId == user.Id);
            if (hasExistingPlan)
            {
                return new IsolatedSeedResult(user.Id, user.UserName ?? sandboxUserName, sandboxEmail, normalizedTag, false, "Sandbox đã có dữ liệu. Dùng overwrite=true để seed lại.");
            }
        }

        var plan = await CreateStudyPlanAsync(user.Id, seedData.StudyPlan);
        foreach (var courseData in seedData.Courses)
        {
            await CreateCourseWithDataAsync(user, plan, courseData);
        }

        return new IsolatedSeedResult(user.Id, user.UserName ?? sandboxUserName, sandboxEmail, normalizedTag, true, "Seed sandbox thành công và không ảnh hưởng dữ liệu user khác.");
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
        return await CreateDemoUserAsync(DemoUserName, "demo@smartstudy.app", "Nguyễn Văn Demo");
    }

    private async Task<User> CreateDemoUserAsync(string userName, string email, string fullName)
    {
        var user = new User
        {
            UserName = userName,
            Email = email,
            FullName = fullName,
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

    private async Task ClearUserDomainDataAsync(int userId)
    {
        var planIds = await _context.StudyPlans
            .Where(x => x.UserId == userId)
            .Select(x => x.Id)
            .ToListAsync();

        var courseIds = await _context.Courses
            .Where(x => planIds.Contains(x.StudyPlanId))
            .Select(x => x.Id)
            .ToListAsync();

        var taskIds = await _context.Tasks
            .Where(x => x.UserId == userId || (x.CourseId.HasValue && courseIds.Contains(x.CourseId.Value)))
            .Select(x => x.Id)
            .ToListAsync();

        var routineIds = await _context.Routines
            .Where(x => x.UserId == userId || (x.CourseId.HasValue && courseIds.Contains(x.CourseId.Value)))
            .Select(x => x.Id)
            .ToListAsync();

        await _context.Logs.Where(x => taskIds.Contains(x.TaskId)).ExecuteDeleteAsync();
        await _context.Schedules.Where(x => x.RoutineId.HasValue && routineIds.Contains(x.RoutineId.Value)).ExecuteDeleteAsync();
        await _context.Tasks.Where(x => taskIds.Contains(x.Id)).ExecuteDeleteAsync();
        await _context.Routines.Where(x => routineIds.Contains(x.Id)).ExecuteDeleteAsync();
        await _context.Phases.Where(x => courseIds.Contains(x.CourseId)).ExecuteDeleteAsync();
        await _context.Courses.Where(x => courseIds.Contains(x.Id)).ExecuteDeleteAsync();
        await _context.StudyPlans.Where(x => planIds.Contains(x.Id)).ExecuteDeleteAsync();
    }

    private static string NormalizeRunTag(string runTag)
    {
        if (string.IsNullOrWhiteSpace(runTag))
        {
            return "thesis";
        }

        var normalized = new string(runTag
            .Trim()
            .ToLowerInvariant()
            .Where(char.IsLetterOrDigit)
            .ToArray());

        return string.IsNullOrWhiteSpace(normalized) ? "thesis" : normalized;
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
                var startDateTime = taskDate.ToDateTime(startTime);
                var endDateTime = startDateTime.AddMinutes(taskDto.PlannedDuration);


                // Tìm routine + schedule nếu có
                Routine? routine = taskDto.RoutineRef is not null
                    ? routineMap.GetValueOrDefault(taskDto.RoutineRef)
                    : null;

                Schedule? schedule = routine?.Schedules.FirstOrDefault();

                var task = new TaskItem
                {
                    Name = taskDto.Name,
                    Type = Enum.Parse<TaskType>(taskDto.Type),
                    StartDateTime = startDateTime,
                    EndDateTime = endDateTime,
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
                    var completedAt = startDateTime
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

public record IsolatedSeedResult(
    int UserId,
    string UserName,
    string Email,
    string RunTag,
    bool Seeded,
    string Message
);