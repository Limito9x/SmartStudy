using Bogus;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Data;

public interface IDatabaseSeeder
{
    Task SeedAsync();
}

public class DatabaseSeeder : IDatabaseSeeder
{
    private const int TargetUserCount = 20;
    private const int TargetTaskCount = 150;
    private const string DefaultPassword = "Demo@1234";

    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;

    public DatabaseSeeder(ApplicationDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task SeedAsync()
    {
        if (await _context.StudyPlans.AnyAsync())
        {
            return;
        }

        var users = await SeedUsersAsync(TargetUserCount);
        var plans = await SeedStudyPlansAsync(users);
        var courses = await SeedCoursesAsync(plans);
        var courseGeneralPhases = await SeedGeneralPhasesAsync(courses);
        await SeedRoutinesAsync(users, plans, courses, courseGeneralPhases);
        await SeedTasksAndLogsAsync(plans, courses, courseGeneralPhases, TargetTaskCount);
        await SeedPhasesAsync(courses);
    }

    private async Task<List<User>> SeedUsersAsync(int targetCount)
    {
        var adminEmail = "admin@smartstudy.dev";
        var existingAdmin = await _userManager.FindByEmailAsync(adminEmail);

        if (existingAdmin == null)
        {
            var adminUser = new User
            {
                UserName = "admin",
                Email = adminEmail,
                FullName = "Quản trị viên",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            await _userManager.CreateAsync(adminUser, "Admin@1234"); // Mật khẩu cho Admin
            await _userManager.AddToRoleAsync(adminUser, "Admin");   // Gán quyền Admin
        }
        
        var studentUsers = await (
            from u in _context.Users
            join ur in _context.Set<IdentityUserRole<int>>() on u.Id equals ur.UserId
            join r in _context.Roles on ur.RoleId equals r.Id
            where r.NormalizedName == "STUDENT"
            select u
        ).Distinct().ToListAsync();

        var users = new List<User>(studentUsers);
        var emails = users
            .Where(u => !string.IsNullOrWhiteSpace(u.Email))
            .Select(u => u.Email!.ToLowerInvariant())
            .ToHashSet();

        var faker = new Faker<User>("vi")
            .RuleFor(u => u.FullName, f => f.Name.FullName())
            .RuleFor(u => u.EmailConfirmed, _ => true)
            .RuleFor(u => u.CreatedAt, f => Utc(f.Date.Between(DateTime.UtcNow.AddMonths(-3), DateTime.UtcNow)));

        var studentInfoFaker = new Faker<StudentInfo>("vi")
            .RuleFor(s => s.University, f => $"{f.Company.CompanyName()} University")
            .RuleFor(s => s.Major, f => f.Name.JobArea())
            .RuleFor(s => s.Cohort, f => $"K{f.Random.Int(45, 52)}");

        var createdUserIds = new List<int>();

        while (users.Count < targetCount)
        {
            var user = faker.Generate();
            var email = BuildUniqueEmail(user.FullName, emails);

            user.Email = email;
            user.UserName = email;

            var createResult = await _userManager.CreateAsync(user, DefaultPassword);
            if (!createResult.Succeeded)
            {
                continue;
            }

            await _userManager.AddToRoleAsync(user, "Student");
            users.Add(user);
            createdUserIds.Add(user.Id);
        }

        if (createdUserIds.Count > 0)
        {
            var infos = createdUserIds
                .Select(id =>
                {
                    var info = studentInfoFaker.Generate();
                    info.UserId = id;
                    return info;
                })
                .ToList();

            await _context.StudentInfos.AddRangeAsync(infos);
            await _context.SaveChangesAsync();
        }

        return users;
    }

    private async Task<List<StudyPlan>> SeedStudyPlansAsync(List<User> users)
    {
        var now = DateTime.UtcNow;
        var faker = new Faker("vi");
        var plans = new List<StudyPlan>();

        foreach (var user in users)
        {
            var activeStart = Utc(faker.Date.Between(now.AddMonths(-3), now.AddDays(-10)));
            var activeEnd = Utc(activeStart.AddDays(faker.Random.Int(50, 140)));
            var completedStart = Utc(activeStart.AddDays(-faker.Random.Int(140, 230)));
            var completedEnd = Utc(activeStart.AddDays(-faker.Random.Int(7, 30)));

            plans.Add(new StudyPlan
            {
                Name = $"{faker.Date.Month()} {activeStart.Year}",
                Order = 1,
                Status = StudyPlanStatus.Active,
                UserId = user.Id,
                StartDate = activeStart,
                EndDate = activeEnd,
                CreatedAt = activeStart,
                ActualStartDate = activeStart
            });

            plans.Add(new StudyPlan
            {
                Name = $"{faker.Date.Month()} {completedStart.Year}",
                Order = 2,
                Status = StudyPlanStatus.Completed,
                UserId = user.Id,
                StartDate = completedStart,
                EndDate = completedEnd,
                CreatedAt = completedStart,
                ActualStartDate = completedStart,
                ActualEndDate = completedEnd
            });
        }

        await _context.StudyPlans.AddRangeAsync(plans);
        await _context.SaveChangesAsync();
        return plans;
    }

    private async Task<List<Course>> SeedCoursesAsync(List<StudyPlan> plans)
    {
        var faker = new Faker<Course>("vi")
            .RuleFor(c => c.Name, f => $"{f.Commerce.ProductAdjective()} {f.Commerce.ProductMaterial()} {f.Hacker.Noun()}")
            .RuleFor(c => c.Color, f => $"#{f.Random.Int(0, 0xFFFFFF):X6}")
            .RuleFor(c => c.TargetScore, f => Math.Round(f.Random.Double(6.0, 9.5), 1))
            .RuleFor(c => c.Goal, f => f.Lorem.Sentence(12));

        var now = DateTime.UtcNow;
        var courses = new List<Course>();

        foreach (var plan in plans)
        {
            var courseCount = Random.Shared.Next(2, 5);
            for (var i = 0; i < courseCount; i++)
            {
                var course = faker.Generate();
                var planEnd = plan.EndDate ?? now;
                var fromDate = plan.StartDate < planEnd ? plan.StartDate : planEnd;
                var toDate = planEnd < now ? planEnd : now;

                course.StudyPlanId = plan.Id;
                course.Status = plan.Status == StudyPlanStatus.Active
                    ? CourseStatus.Enrolled
                    : CourseStatus.Completed;
                course.FinalScore = course.Status == CourseStatus.Completed
                    ? Math.Round(new Faker().Random.Double(6.0, 9.5), 1)
                    : null;
                course.CreatedAt = Utc(new Faker().Date.Between(fromDate, toDate));

                courses.Add(course);
            }
        }

        await _context.Courses.AddRangeAsync(courses);
        await _context.SaveChangesAsync();
        return courses;
    }

    private async Task SeedRoutinesAsync(List<User> users, List<StudyPlan> plans, List<Course> courses, Dictionary<int, int> courseGeneralPhases)
    {
        var activePlanById = plans
            .Where(p => p.Status == StudyPlanStatus.Active)
            .ToDictionary(p => p.Id);
        var userById = users.ToDictionary(u => u.Id);

        var activeCourses = courses
            .Where(c => activePlanById.ContainsKey(c.StudyPlanId))
            .ToList();

        var routineFaker = new Faker<Routine>("vi")
            .RuleFor(r => r.Name, f => $"{f.Hacker.Verb()} {f.Hacker.Noun()} session")
            .RuleFor(r => r.Description, f => f.Lorem.Sentence(8))
            .RuleFor(r => r.Instructor, f => f.Name.FullName())
            .RuleFor(r => r.Type, f => f.PickRandom<TaskType>())
            .RuleFor(r => r.CreatedAt, _ => DateTime.UtcNow);

        var scheduleFaker = new Faker<Schedule>("vi")
            .RuleFor(s => s.DayOfWeek, f => f.PickRandom<DayOfWeek>())
            .RuleFor(s => s.StartTime, f => new TimeOnly(f.Random.Int(6, 20), f.PickRandom(0, 15, 30, 45)))
            .RuleFor(s => s.Duration, f => f.Random.Int(45, 120))
            .RuleFor(s => s.Location, f => f.Address.City());

        var routines = new List<Routine>();

        foreach (var course in activeCourses)
        {
            var plan = activePlanById[course.StudyPlanId];
            var user = userById[plan.UserId];
            var routineCount = Random.Shared.Next(1, 3);

            for (var i = 0; i < routineCount; i++)
            {
                var routine = routineFaker.Generate();
                routine.UserId = user.Id;
                routine.User = user;
                routine.StudyPlanId = plan.Id;
                routine.PhaseId = courseGeneralPhases[course.Id];
                routine.StartDate = plan.StartDate;
                routine.EndDate = plan.EndDate;

                var schedules = scheduleFaker.Generate(Random.Shared.Next(1, 3));
                foreach (var schedule in schedules)
                {
                    routine.Schedules.Add(schedule);
                }

                routines.Add(routine);
            }
        }

        await _context.Routines.AddRangeAsync(routines);
        await _context.SaveChangesAsync();
    }

    private async Task SeedTasksAndLogsAsync(List<StudyPlan> plans, List<Course> courses, Dictionary<int, int> courseGeneralPhases, int taskCount)
    {
        var activePlanById = plans
            .Where(p => p.Status == StudyPlanStatus.Active)
            .ToDictionary(p => p.Id);

        var activeCourses = courses
            .Where(c => activePlanById.ContainsKey(c.StudyPlanId))
            .ToList();

        if (activeCourses.Count == 0)
        {
            return;
        }

        var taskFaker = new Faker<TaskItem>("vi")
            .RuleFor(t => t.Name, f => $"{f.Hacker.Verb()} {f.Commerce.ProductAdjective()} {f.Hacker.Noun()}")
            .RuleFor(t => t.Type, f => f.PickRandom<TaskType>())
            .RuleFor(t => t.Status, _ => SmartStudy.Server.Entities.Enums.TaskStatus.Completed)
            .RuleFor(t => t.Location, f => f.Address.City());

        var tasks = new List<TaskItem>();

        for (var i = 0; i < taskCount; i++)
        {
            var localFaker = new Faker("vi");
            var course = localFaker.PickRandom(activeCourses);
            var plan = activePlanById[course.StudyPlanId];

            var taskDateUtc = Utc(localFaker.Date.Recent(40, DateTime.UtcNow));
            var startTime = new TimeOnly(localFaker.Random.Int(6, 21), localFaker.PickRandom(0, 15, 30, 45));
            var startDateTime = taskDateUtc.Date.Add(startTime.ToTimeSpan());
            var plannedDuration = localFaker.Random.Int(30, 180);
            var endDateTime = startDateTime.AddMinutes(plannedDuration);

            var task = taskFaker.Generate();
            task.UserId = plan.UserId;
            task.StudyPlanId = plan.Id;
            task.PhaseId = courseGeneralPhases[course.Id];
            task.StartDateTime = startDateTime;
            task.EndDateTime = endDateTime;
            task.CreatedAt = Utc(startDateTime);

            tasks.Add(task);
        }

        await _context.Tasks.AddRangeAsync(tasks);
        await _context.SaveChangesAsync();

        var logFaker = new Faker<LogItem>("vi")
            .RuleFor(l => l.ComprehensionLevel, f => f.PickRandom<ComprehensionLevel>())
            .RuleFor(l => l.DifficultyLevel, f => f.PickRandom<DifficultyLevel>())
            .RuleFor(l => l.Note, f => f.Random.Bool(0.2f) ? f.Lorem.Sentence(8) : null);

        var logs = new List<LogItem>();

        foreach (var task in tasks)
        {
            var planned = (task.EndDateTime - task.StartDateTime)?.TotalMinutes ?? 60;
            var variance = new Faker().Random.Double(0.6, 1.4);
            var actualDuration = Math.Max(15, (int)Math.Round(planned * variance));
            var taskStart = task.StartDateTime ?? task.CreatedAt;
            var completedAt = Utc(taskStart.AddMinutes(actualDuration));

            var log = logFaker.Generate();
            log.TaskId = task.Id;
            log.ActualDuration = actualDuration;
            log.CompletedAt = completedAt;
            log.CreatedAt = completedAt;

            logs.Add(log);
        }

        await _context.Logs.AddRangeAsync(logs);
        await _context.SaveChangesAsync();
    }

    private async Task<Dictionary<int, int>> SeedGeneralPhasesAsync(List<Course> courses)
    {
        var phases = courses.Select(c => new Phase
        {
            CourseId = c.Id,
            Title = "Công việc chung",
            Type = PhaseType.General,
            Priority = PriorityLevel.Medium,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await _context.Phases.AddRangeAsync(phases);
        await _context.SaveChangesAsync();

        return phases.ToDictionary(p => p.CourseId, p => p.Id);
    }

    private async Task SeedPhasesAsync(List<Course> courses)
    {
        if (courses.Count == 0)
        {
            return;
        }

        var faker = new Faker<Phase>("vi")
            .RuleFor(e => e.Title, f => f.Lorem.Sentence(5))
            .RuleFor(e => e.Type, f => f.PickRandom<PhaseType>())
            .RuleFor(e => e.Priority, f => f.PickRandom<PriorityLevel>())
            .RuleFor(e => e.StartDateTime, f => Utc(f.Date.Soon(35, DateTime.UtcNow)))
            .RuleFor(e => e.EndDateTime, f => Utc(f.Date.Soon(25, DateTime.UtcNow)))
            .RuleFor(e => e.Location, f => f.Address.City())
            .RuleFor(e => e.Notes, f => f.Lorem.Sentence(12));

        var phases = new List<Phase>();

        foreach (var course in courses.Take(30))
        {
            var count = Random.Shared.Next(1, 3);
            for (var i = 0; i < count; i++)
            {
                var phase = faker.Generate();
                phase.Type = phase.Type == PhaseType.General ? PhaseType.Custom : phase.Type;
                phase.CourseId = course.Id;
                phase.CreatedAt = Utc(new Faker().Date.Recent(20, DateTime.UtcNow));
                phases.Add(phase);
            }
        }

        await _context.Phases.AddRangeAsync(phases);
        await _context.SaveChangesAsync();
    }

    private static string BuildUniqueEmail(string fullName, ISet<string> existingEmails)
    {
        var faker = new Faker("vi");
        var baseEmail = faker.Internet.Email(fullName.Replace(" ", "."), provider: "smartstudy.dev").ToLowerInvariant();
        var email = baseEmail;
        var suffix = 1;

        while (existingEmails.Contains(email))
        {
            email = $"{baseEmail.Split('@')[0]}.{suffix}@smartstudy.dev";
            suffix++;
        }

        existingEmails.Add(email);
        return email;
    }

    private static DateTime Utc(DateTime value)
    {
        return value.Kind == DateTimeKind.Utc
            ? value
            : DateTime.SpecifyKind(value, DateTimeKind.Utc);
    }
}