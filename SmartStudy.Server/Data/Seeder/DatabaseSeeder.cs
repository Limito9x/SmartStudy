using Bogus;
using Microsoft.AspNetCore.Identity;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Data
{
    public static class DatabaseSeeder
    {
        // Chạy idempotent — gọi lại không bị lỗi
        public static async Task SeedAsync(
            ApplicationDbContext context,
            UserManager<User> userManager)
        {
            if (context.StudyPlans.Any()) return;

            Randomizer.Seed = new Random(42); // Seed cố định → data nhất quán mỗi lần chạy

            var user = await SeedUserAsync(userManager, context);
            var plans = SeedStudyPlans(context, user);
            var courses = SeedCourses(context, plans);
            SeedRoutinesAndSchedules(context, user, plans, courses);
            SeedTasksAndLogs(context, user, plans, courses);
            SeedTimelineEvents(context, courses);

            await context.SaveChangesAsync();
        }

        // ─── 1. USER ────────────────────────────────────────────────────────────
        private static async Task<User> SeedUserAsync(
            UserManager<User> userManager,
            ApplicationDbContext context)
        {
            const string email = "thuan@smartstudy.dev";
            var existing = await userManager.FindByEmailAsync(email);
            if (existing != null) return existing;

            var user = new User
            {
                FullName = "Lê Công Thuận",
                UserName = email,
                Email = email,
                EmailConfirmed = true,
            };

            await userManager.CreateAsync(user, "Demo@1234");
            await userManager.AddToRoleAsync(user, "Student");

            context.StudentInfos.Add(new StudentInfo
            {
                UserId = user.Id,
                University = "Đại học Cần Thơ",
                Major = "Kỹ thuật phần mềm",
                Cohort = "K48"
            });

            await context.SaveChangesAsync();
            return user;
        }

        // ─── 2. STUDY PLANS ─────────────────────────────────────────────────────
        private static List<StudyPlan> SeedStudyPlans(
            ApplicationDbContext context, User user)
        {
            var now = DateTime.UtcNow;

            var plans = new List<StudyPlan>
            {
                new StudyPlan
                {
                    Name = "Spring 2026",
                    UserId = user.Id,
                    Order = 1,
                    StartDate = now.AddMonths(-3),
                    EndDate = now.AddMonths(2),
                    CreatedAt = now.AddMonths(-3),
                },
                new StudyPlan
                {
                    Name = "Winter 2025",
                    UserId = user.Id,
                    Order = 2,
                    StartDate = now.AddMonths(-6),
                    EndDate = now.AddMonths(-3).AddDays(-1),
                    CreatedAt = now.AddMonths(-6),
                    ActualStartDate = now.AddMonths(-6),
                    ActualEndDate = now.AddMonths(-3).AddDays(-1),
                }
            };

            context.StudyPlans.AddRange(plans);
            context.SaveChanges();
            return plans;
        }

        // ─── 3. COURSES ─────────────────────────────────────────────────────────
        private static List<Course> SeedCourses(
            ApplicationDbContext context, List<StudyPlan> plans)
        {
            var currentPlan = plans[0];
            var prevPlan = plans[1];

            var courses = new List<Course>
            {
                // Kỳ hiện tại
                new Course
                {
                    Name = "Cấu trúc dữ liệu & Giải thuật",
                    Color = "#7F77DD",
                    Status = CourseStatus.Enrolled,
                    TargetScore = 8.5,
                    Goal = "Hiểu sâu các cấu trúc dữ liệu cơ bản, nắm vững Big-O",
                    StudyPlanId = currentPlan.Id,
                    CreatedAt = currentPlan.StartDate,
                },
                new Course
                {
                    Name = "Mạng máy tính",
                    Color = "#1D9E75",
                    Status = CourseStatus.Enrolled,
                    TargetScore = 7.5,
                    Goal = "Hiểu mô hình OSI và TCP/IP, cấu hình được mạng cơ bản",
                    StudyPlanId = currentPlan.Id,
                    CreatedAt = currentPlan.StartDate,
                },
                new Course
                {
                    Name = "IELTS",
                    Color = "#BA7517",
                    Status = CourseStatus.Enrolled,
                    TargetScore = 6.5,
                    Goal = "Đạt 6.5 overall trước tháng 6, tập trung Writing và Listening",
                    StudyPlanId = currentPlan.Id,
                    CreatedAt = currentPlan.StartDate,
                },
                // Kỳ trước — đã xong
                new Course
                {
                    Name = "Lập trình hướng đối tượng",
                    Status = CourseStatus.Completed,
                    Color = "#BA7517",
                    TargetScore = 8.0,
                    FinalScore = 8.5,
                    Goal = "Nắm vững OOP, SOLID principles",
                    StudyPlanId = prevPlan.Id,
                    CreatedAt = prevPlan.StartDate,
                },
                new Course
                {
                    Name = "Cơ sở dữ liệu",
                    Color = "#1D9E75",
                    Status = CourseStatus.Completed,
                    TargetScore = 8.0,
                    FinalScore = 7.8,
                    Goal = "Thiết kế schema tốt, viết query tối ưu",
                    StudyPlanId = prevPlan.Id,
                    CreatedAt = prevPlan.StartDate,
                },
            };

            context.Courses.AddRange(courses);
            context.SaveChanges();
            return courses;
        }

        // ─── 4. ROUTINES & SCHEDULES ────────────────────────────────────────────
        private static void SeedRoutinesAndSchedules(
            ApplicationDbContext context,
            User user,
            List<StudyPlan> plans,
            List<Course> courses)
        {
            var currentPlan = plans[0];
            var dsaCourse = courses[0];   // CTDL
            var netCourse = courses[1];   // Mạng
            var ielts = courses[2];       // IELTS
            var now = DateTime.UtcNow;

            var routines = new List<Routine>
            {
                new Routine
                {
                    Name = "Lecture — Cấu trúc dữ liệu",
                    Instructor = "TS. Nguyễn Văn Hùng",
                    Type = TaskType.ClassSession,
                    StartDate = currentPlan.StartDate,
                    EndDate = currentPlan.EndDate,
                    NextOccurrence = NextOccurrence(DayOfWeek.Monday, new TimeOnly(7, 30)),
                    UserId = user.Id,
                    User = user,
                    StudyPlanId = currentPlan.Id,
                    CourseId = dsaCourse.Id,
                    Schedules = new List<Schedule>
                    {
                        new Schedule { DayOfWeek = DayOfWeek.Monday, StartTime = new TimeOnly(7, 30), Duration = 90, Location = "P.A204" },
                        new Schedule { DayOfWeek = DayOfWeek.Wednesday, StartTime = new TimeOnly(7, 30), Duration = 90, Location = "P.A204" },
                    }
                },
                new Routine
                {
                    Name = "Lecture — Mạng máy tính",
                    Instructor = "ThS. Trần Thị Lan",
                    Type = TaskType.ClassSession,
                    StartDate = currentPlan.StartDate,
                    EndDate = currentPlan.EndDate,
                    NextOccurrence = NextOccurrence(DayOfWeek.Tuesday, new TimeOnly(9, 30)),
                    UserId = user.Id,
                    User = user,
                    StudyPlanId = currentPlan.Id,
                    CourseId = netCourse.Id,
                    Schedules = new List<Schedule>
                    {
                        new Schedule { DayOfWeek = DayOfWeek.Tuesday, StartTime = new TimeOnly(9, 30), Duration = 90, Location = "P.B101" },
                        new Schedule { DayOfWeek = DayOfWeek.Thursday, StartTime = new TimeOnly(9, 30), Duration = 90, Location = "P.B101" },
                    }
                },
                new Routine
                {
                    Name = "IELTS Listening Practice",
                    Type = TaskType.SelfStudy,
                    StartDate = currentPlan.StartDate,
                    EndDate = currentPlan.EndDate,
                    NextOccurrence = NextOccurrence(DayOfWeek.Saturday, new TimeOnly(19, 0)),
                    UserId = user.Id,
                    User = user,
                    StudyPlanId = currentPlan.Id,
                    CourseId = ielts.Id,
                    Schedules = new List<Schedule>
                    {
                        new Schedule { DayOfWeek = DayOfWeek.Saturday, StartTime = new TimeOnly(19, 0), Duration = 60 },
                        new Schedule { DayOfWeek = DayOfWeek.Sunday,   StartTime = new TimeOnly(19, 0), Duration = 60 },
                    }
                },
            };

            context.Routines.AddRange(routines);
            context.SaveChanges();
        }

        // ─── 5. TASKS & LOGS ────────────────────────────────────────────────────
        private static void SeedTasksAndLogs(
            ApplicationDbContext context,
            User user,
            List<StudyPlan> plans,
            List<Course> courses)
        {
            var currentPlan = plans[0];
            var faker = new Faker("vi");
            var now = DateTime.UtcNow;
            var today = DateOnly.FromDateTime(now);
            var random = new Random(42);

            // Dữ liệu task + log trong 6 tuần gần nhất
            var taskFaker = new Faker<TaskItem>()
                .RuleFor(t => t.UserId, _ => user.Id)
                .RuleFor(t => t.User, _ => user)
                .RuleFor(t => t.StudyPlanId, _ => currentPlan.Id)
                .RuleFor(t => t.Status, _ => Entities.Enums.TaskStatus.Completed)
                .RuleFor(t => t.CreatedAt, f => now.AddDays(-f.Random.Int(1, 42)));

            var tasks = new List<TaskItem>();

            // CTDL tasks — 72% tiến độ, nhiều log nhất
            var dsaTasks = new (string name, TaskType type, int planned, int course)[]
            {
                ("Ôn tập Array và Linked List",         TaskType.SelfStudy,      60,  0),
                ("Bài tập Stack và Queue",               TaskType.AssignmentWork, 90,  0),
                ("Tìm hiểu Binary Search Tree",          TaskType.SelfStudy,      75,  0),
                ("Giải bài Dijkstra algorithm",          TaskType.AssignmentWork, 90,  0),
                ("Ôn tập Graph traversal (BFS/DFS)",     TaskType.SelfStudy,      60,  0),
                ("Bài tập Dynamic Programming cơ bản",  TaskType.AssignmentWork, 120, 0),
                ("Lecture — Sorting algorithms",         TaskType.ClassSession,   90,  0),
                ("Lecture — Tree structures",            TaskType.ClassSession,   90,  0),
            };

            // Mạng tasks — 45% tiến độ, ít log hơn
            var netTasks = new (string name, TaskType type, int planned, int course)[]
            {
                ("Đọc tài liệu mô hình OSI",              TaskType.SelfStudy,      60, 1),
                ("Lecture — TCP/IP model",                 TaskType.ClassSession,   90, 1),
                ("Bài tập phân tích gói tin Wireshark",   TaskType.AssignmentWork, 75, 1),
                ("Tìm hiểu DNS và HTTP",                   TaskType.SelfStudy,      60, 1),
            };

            // IELTS tasks — 60% tiến độ
            var ieltsTasks = new (string name, TaskType type, int planned, int course)[]
            {
                ("Listening Practice Test 1",             TaskType.SelfStudy,      60, 2),
                ("Writing Task 2 — Essay outline",        TaskType.AssignmentWork, 45, 2),
                ("Vocabulary — Academic Word List",        TaskType.SelfStudy,      30, 2),
                ("Listening Practice Test 2",             TaskType.SelfStudy,      60, 2),
                ("Reading — True/False/NG practice",      TaskType.AssignmentWork, 60, 2),
            };

            var allTaskDefs = dsaTasks.Concat(netTasks).Concat(ieltsTasks).ToArray();

            foreach (var (name, type, planned, courseIdx) in allTaskDefs)
            {
                var daysAgo = random.Next(1, 40);
                var taskDate = today.AddDays(-daysAgo);

                var task = new TaskItem
                {
                    Name = name,
                    Type = type,
                    PlannedDuration = planned,
                    TaskDate = taskDate,
                    StartTime = new TimeOnly(random.Next(7, 21), 0),
                    Status = Entities.Enums.TaskStatus.Completed,
                    UserId = user.Id,
                    User = user,
                    CourseId = courses[courseIdx].Id,
                    StudyPlanId = currentPlan.Id,
                    CreatedAt = DateTime.SpecifyKind(taskDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc),
                };

                // Sinh log cho mỗi task
                var actualDuration = (int)(planned * (0.7 + random.NextDouble() * 0.6));
                task.Logs = new List<LogItem>
                {
                    new LogItem
                    {
                        ActualDuration = actualDuration,
                        ComprehensionLevel = (ComprehensionLevel)random.Next(1, 4), // Basic=1, Intermediate=2, Advanced=3
                        DifficultyLevel = (DifficultyLevel)random.Next(0, 3),       // Easy=0, Medium=1, Hard=2
                        CompletedAt = DateTime.SpecifyKind(
                            taskDate.ToDateTime(new TimeOnly(random.Next(8, 22), 0)),
                            DateTimeKind.Utc),
                        Note = courseIdx == 1 && random.Next(0, 3) == 0
                            ? "Cần ôn lại phần này, chưa hiểu rõ"
                            : null,
                        Task = task,
                        CreatedAt = DateTime.SpecifyKind(
                            taskDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc),
                    }
                };

                tasks.Add(task);
            }

            // Thêm 2 task hôm nay — chưa làm (để dashboard hiện "2 tasks hôm nay")
            tasks.Add(new TaskItem
            {
                Name = "Bài tập: Heap Sort implementation",
                Type = TaskType.AssignmentWork,
                PlannedDuration = 90,
                TaskDate = today,
                StartTime = new TimeOnly(20, 0),
                Status = Entities.Enums.TaskStatus.Pending,
                UserId = user.Id,
                User = user,
                CourseId = courses[0].Id,
                StudyPlanId = currentPlan.Id,
                CreatedAt = now.AddDays(-1),
            });

            tasks.Add(new TaskItem
            {
                Name = "IELTS Listening Practice Test 3",
                Type = TaskType.SelfStudy,
                PlannedDuration = 60,
                TaskDate = today,
                StartTime = new TimeOnly(19, 0),
                Status = Entities.Enums.TaskStatus.Pending,
                UserId = user.Id,
                User = user,
                CourseId = courses[2].Id,
                StudyPlanId = currentPlan.Id,
                CreatedAt = now.AddDays(-1),
            });

            context.Tasks.AddRange(tasks);
            context.SaveChanges();
        }

        // ─── 6. TIMELINE EVENTS ─────────────────────────────────────────────────
        private static void SeedTimelineEvents(
            ApplicationDbContext context, List<Course> courses)
        {
            var now = DateTime.UtcNow;
            var dsaCourse = courses[0];
            var netCourse = courses[1];
            var ielts = courses[2];

            var events = new List<TimelineEvent>
            {
                new TimelineEvent
                {
                    CourseId = dsaCourse.Id,
                    Title = "Thi giữa kỳ — Cấu trúc dữ liệu",
                    Type = EventType.Exam,
                    Priority = PriorityLevel.High,
                    DueDate = now.AddDays(14),
                    Location = "P.A101",
                    Notes = "Chương 1-5: Array, Linked List, Stack, Queue, Tree",
                    CreatedAt = now.AddDays(-10),
                },
                new TimelineEvent
                {
                    CourseId = dsaCourse.Id,
                    Title = "Nộp bài tập lớn — Đồ thị",
                    Type = EventType.Assignment,
                    Priority = PriorityLevel.Medium,
                    DueDate = now.AddDays(7),
                    Notes = "Cài đặt BFS, DFS và Dijkstra, viết báo cáo",
                    CreatedAt = now.AddDays(-20),
                },
                new TimelineEvent
                {
                    CourseId = netCourse.Id,
                    Title = "Thi giữa kỳ — Mạng máy tính",
                    Type = EventType.Exam,
                    Priority = PriorityLevel.High,
                    DueDate = now.AddDays(21),
                    Location = "P.B202",
                    Notes = "Mô hình OSI, TCP/IP, DNS, HTTP",
                    CreatedAt = now.AddDays(-10),
                },
                new TimelineEvent
                {
                    CourseId = ielts.Id,
                    Title = "IELTS Mock Test",
                    Type = EventType.Exam,
                    Priority = PriorityLevel.High,
                    DueDate = now.AddDays(30),
                    Notes = "Full test 4 kỹ năng, đánh giá trước khi đăng ký thi thật",
                    CreatedAt = now.AddDays(-5),
                },
            };

            context.TimelineEvents.AddRange(events);
            context.SaveChanges();
        }

        // ─── HELPER ─────────────────────────────────────────────────────────────
        private static DateTime NextOccurrence(DayOfWeek day, TimeOnly time)
        {
            var today = DateTime.UtcNow.Date;
            var daysUntil = ((int)day - (int)today.DayOfWeek + 7) % 7;
            if (daysUntil == 0) daysUntil = 7;
            return DateTime.SpecifyKind(
                today.AddDays(daysUntil).Add(time.ToTimeSpan()),
                DateTimeKind.Utc);
        }
    }
}