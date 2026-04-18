using Microsoft.EntityFrameworkCore;
using Neo4j.Driver;
using SmartStudy.Server.Data;
using SmartStudy.Server.Entities.Enums;

namespace SmartStudy.Server.Integrations.Neo4j
{
    public class GraphSyncService : IGraphSyncService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IDriver _driver;

        public GraphSyncService(ApplicationDbContext dbContext, IDriver driver)
        {
            _dbContext = dbContext;
            _driver = driver;
        }

        public async Task SyncUserAsync(int userId)
        {
            var user = await _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                await DeleteUserAsync(userId);
                return;
            }

            var query = @"
MERGE (u:User {pg_id: $pg_id})
SET u.full_name = $full_name,
    u.created_at = CASE WHEN u.created_at IS NULL THEN datetime($created_at) ELSE u.created_at END,
    u.updated_at = datetime()
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = user.Id.ToString(),
                ["full_name"] = user.FullName,
                ["created_at"] = ToIso(user.CreatedAt)
            });
        }

        public async Task SyncStudyPlanAsync(int studyPlanId)
        {
            var studyPlan = await _dbContext.StudyPlans
                .AsNoTracking()
                .Where(sp => sp.Id == studyPlanId)
                .Select(sp => new
                {
                    sp.Id,
                    sp.UserId,
                    sp.Name,
                    Status = sp.Status.ToString(),
                    Type = sp.Type.ToString(),
                    sp.StartDate,
                    sp.EndDate,
                    sp.CreatedAt,
                    sp.UpdatedAt,
                    UserFullName = sp.User != null ? sp.User.FullName : null
                })
                .FirstOrDefaultAsync();

            if (studyPlan == null)
            {
                await DeleteStudyPlanAsync(studyPlanId);
                return;
            }

            var query = @"
MERGE (u:User {pg_id: $user_pg_id})
SET u.full_name = CASE WHEN $user_full_name IS NULL THEN u.full_name ELSE $user_full_name END,
    u.updated_at = datetime()
MERGE (sp:StudyPlan {pg_id: $pg_id})
SET sp.name = $name,
    sp.status = $status,
    sp.type = $type,
    sp.start_date = datetime($start_date),
    sp.end_date = CASE WHEN $end_date IS NULL THEN NULL ELSE datetime($end_date) END,
    sp.created_at = CASE WHEN sp.created_at IS NULL THEN datetime($created_at) ELSE sp.created_at END,
    sp.updated_at = CASE WHEN $updated_at IS NULL THEN datetime() ELSE datetime($updated_at) END
WITH u, sp
OPTIONAL MATCH (:User)-[old:OWNS_PLAN]->(sp)
DELETE old
MERGE (u)-[:OWNS_PLAN]->(sp)
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = studyPlan.Id.ToString(),
                ["user_pg_id"] = studyPlan.UserId.ToString(),
                ["name"] = studyPlan.Name,
                ["status"] = studyPlan.Status,
                ["type"] = studyPlan.Type,
                ["start_date"] = ToIso(studyPlan.StartDate),
                ["end_date"] = ToIsoNullable(studyPlan.EndDate),
                ["created_at"] = ToIso(studyPlan.CreatedAt),
                ["updated_at"] = ToIsoNullable(studyPlan.UpdatedAt),
                ["user_full_name"] = studyPlan.UserFullName
            });
        }

        public async Task SyncCourseAsync(int courseId)
        {
            var course = await _dbContext.Courses
                .AsNoTracking()
                .Where(c => c.Id == courseId)
                .Select(c => new
                {
                    c.Id,
                    c.StudyPlanId,
                    c.Name,
                    Status = c.Status.ToString(),
                    c.Goal,
                    c.TargetScore,
                    c.FinalScore,
                    c.CreatedAt,
                    c.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (course == null)
            {
                await DeleteCourseAsync(courseId);
                return;
            }

            var query = @"
MERGE (sp:StudyPlan {pg_id: $study_plan_pg_id})
MERGE (c:Course {pg_id: $pg_id})
SET c.name = $name,
    c.status = $status,
    c.goal = $goal,
    c.target_score = $target_score,
    c.final_score = $final_score,
    c.created_at = CASE WHEN c.created_at IS NULL THEN datetime($created_at) ELSE c.created_at END,
    c.updated_at = CASE WHEN $updated_at IS NULL THEN datetime() ELSE datetime($updated_at) END
WITH sp, c
OPTIONAL MATCH (:StudyPlan)-[old:HAS_COURSE]->(c)
DELETE old
MERGE (sp)-[:HAS_COURSE]->(c)
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = course.Id.ToString(),
                ["study_plan_pg_id"] = course.StudyPlanId.ToString(),
                ["name"] = course.Name,
                ["status"] = course.Status,
                ["goal"] = course.Goal,
                ["target_score"] = course.TargetScore,
                ["final_score"] = course.FinalScore,
                ["created_at"] = ToIso(course.CreatedAt),
                ["updated_at"] = ToIsoNullable(course.UpdatedAt)
            });
        }

        public async Task SyncPhaseAsync(int phaseId)
        {
            var phase = await _dbContext.Phases
                .AsNoTracking()
                .Where(p => p.Id == phaseId)
                .Select(p => new
                {
                    p.Id,
                    p.CourseId,
                    p.Title,
                    Type = p.Type.ToString(),
                    p.StartDateTime,
                    p.EndDateTime,
                    p.CreatedAt,
                    p.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (phase == null)
            {
                await DeletePhaseAsync(phaseId);
                return;
            }

            var query = @"
MERGE (c:Course {pg_id: $course_pg_id})
SET c.updated_at = datetime()
MERGE (p:Phase {pg_id: $pg_id})
SET p.title = $title,
    p.type = $type,
    p.start_datetime = CASE WHEN $start_datetime IS NULL THEN NULL ELSE datetime($start_datetime) END,
    p.end_datetime = CASE WHEN $end_datetime IS NULL THEN NULL ELSE datetime($end_datetime) END,
    p.created_at = CASE WHEN p.created_at IS NULL THEN datetime($created_at) ELSE p.created_at END,
    p.updated_at = CASE WHEN $updated_at IS NULL THEN datetime() ELSE datetime($updated_at) END
WITH c, p
OPTIONAL MATCH (:Course)-[old:HAS_PHASE]->(p)
DELETE old
MERGE (c)-[:HAS_PHASE]->(p)
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = phase.Id.ToString(),
                ["course_pg_id"] = phase.CourseId.ToString(),
                ["title"] = phase.Title,
                ["type"] = phase.Type,
                ["start_datetime"] = ToIsoNullable(phase.StartDateTime),
                ["end_datetime"] = ToIsoNullable(phase.EndDateTime),
                ["created_at"] = ToIso(phase.CreatedAt),
                ["updated_at"] = ToIsoNullable(phase.UpdatedAt)
            });
        }

        public async Task SyncRoutineAsync(int routineId)
        {
            var routine = await _dbContext.Routines
                .AsNoTracking()
                .Where(r => r.Id == routineId)
                .Select(r => new
                {
                    r.Id,
                    r.PhaseId,
                    r.Name,
                    Type = r.Type.ToString(),
                    r.IsActive,
                    r.StartDate,
                    r.EndDate,
                    r.CreatedAt,
                    r.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (routine == null)
            {
                await DeleteRoutineAsync(routineId);
                return;
            }

            var query = @"
MERGE (r:Routine {pg_id: $pg_id})
SET r.name = $name,
    r.type = $type,
    r.is_active = $is_active,
    r.start_date = datetime($start_date),
    r.end_date = CASE WHEN $end_date IS NULL THEN NULL ELSE datetime($end_date) END,
    r.created_at = CASE WHEN r.created_at IS NULL THEN datetime($created_at) ELSE r.created_at END,
    r.updated_at = CASE WHEN $updated_at IS NULL THEN datetime() ELSE datetime($updated_at) END
WITH r
OPTIONAL MATCH (:Phase)-[old:CONTAINS]->(r)
DELETE old
WITH r
OPTIONAL MATCH (phase:Phase {pg_id: $phase_pg_id})
FOREACH (_ IN CASE WHEN phase IS NULL THEN [] ELSE [1] END |
    MERGE (phase)-[:CONTAINS]->(r)
)
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = routine.Id.ToString(),
                ["phase_pg_id"] = routine.PhaseId?.ToString(),
                ["name"] = routine.Name,
                ["type"] = routine.Type,
                ["is_active"] = routine.IsActive,
                ["start_date"] = ToIso(routine.StartDate),
                ["end_date"] = ToIsoNullable(routine.EndDate),
                ["created_at"] = ToIso(routine.CreatedAt),
                ["updated_at"] = ToIsoNullable(routine.UpdatedAt)
            });
        }

        public async Task SyncTaskAsync(int taskId)
        {
            var task = await _dbContext.Tasks
                .AsNoTracking()
                .Where(t => t.Id == taskId)
                .Select(t => new
                {
                    t.Id,
                    t.PhaseId,
                    t.RoutineId,
                    t.Name,
                    Status = t.Status.ToString(),
                    Type = t.Type.ToString(),
                    t.Description,
                    t.StartDateTime,
                    t.EndDateTime,
                    t.CreatedAt,
                    t.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (task == null)
            {
                await DeleteTaskAsync(taskId);
                return;
            }

            var query = @"
MERGE (t:Task {pg_id: $pg_id})
SET t.name = $name,
    t.status = $status,
    t.type = $type,
    t.description = $description,
    t.start_datetime = CASE WHEN $start_datetime IS NULL THEN NULL ELSE datetime($start_datetime) END,
    t.end_datetime = CASE WHEN $end_datetime IS NULL THEN NULL ELSE datetime($end_datetime) END,
    t.created_at = CASE WHEN t.created_at IS NULL THEN datetime($created_at) ELSE t.created_at END,
    t.updated_at = CASE WHEN $updated_at IS NULL THEN datetime() ELSE datetime($updated_at) END
WITH t
OPTIONAL MATCH (:Phase)-[oldPhase:CONTAINS]->(t)
DELETE oldPhase
WITH t
OPTIONAL MATCH (:Routine)-[oldRoutine:CONTAINS_TASK]->(t)
DELETE oldRoutine
WITH t
OPTIONAL MATCH (phase:Phase {pg_id: $phase_pg_id})
FOREACH (_ IN CASE WHEN phase IS NULL THEN [] ELSE [1] END |
    MERGE (phase)-[:CONTAINS]->(t)
)
WITH t
OPTIONAL MATCH (routine:Routine {pg_id: $routine_pg_id})
FOREACH (_ IN CASE WHEN routine IS NULL THEN [] ELSE [1] END |
    MERGE (routine)-[:CONTAINS_TASK]->(t)
)
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = task.Id.ToString(),
                ["phase_pg_id"] = task.PhaseId?.ToString(),
                ["routine_pg_id"] = task.RoutineId?.ToString(),
                ["name"] = task.Name,
                ["status"] = task.Status,
                ["type"] = task.Type,
                ["description"] = task.Description,
                ["start_datetime"] = ToIsoNullable(task.StartDateTime),
                ["end_datetime"] = ToIsoNullable(task.EndDateTime),
                ["created_at"] = ToIso(task.CreatedAt),
                ["updated_at"] = ToIsoNullable(task.UpdatedAt)
            });
        }

        public async Task SyncLogAsync(int logId)
        {
            var log = await _dbContext.Logs
                .AsNoTracking()
                .Where(l => l.Id == logId)
                .Select(l => new
                {
                    l.Id,
                    l.TaskId,
                    l.Note,
                    l.ActualDuration,
                    l.CompletedAt,
                    ComprehensionLevel = l.ComprehensionLevel.HasValue ? l.ComprehensionLevel.Value.ToString() : null,
                    DifficultyLevel = l.DifficultyLevel.HasValue ? l.DifficultyLevel.Value.ToString() : null,
                    l.TimerStartAt,
                    l.TimerEndAt,
                    l.EarnedValue,
                    l.CreatedAt,
                    l.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (log == null)
            {
                await DeleteLogAsync(logId);
                return;
            }

            var query = @"
MERGE (l:Log {pg_id: $pg_id})
SET l.note = $note,
    l.actual_duration = $actual_duration,
    l.completed_at = CASE WHEN $completed_at IS NULL THEN NULL ELSE datetime($completed_at) END,
    l.comprehension_level = $comprehension_level,
    l.difficulty_level = $difficulty_level,
    l.timer_start_at = CASE WHEN $timer_start_at IS NULL THEN NULL ELSE datetime($timer_start_at) END,
    l.timer_end_at = CASE WHEN $timer_end_at IS NULL THEN NULL ELSE datetime($timer_end_at) END,
    l.earned_value = $earned_value,
    l.created_at = CASE WHEN l.created_at IS NULL THEN datetime($created_at) ELSE l.created_at END,
    l.updated_at = CASE WHEN $updated_at IS NULL THEN datetime() ELSE datetime($updated_at) END
WITH l
OPTIONAL MATCH (:Task)-[old:HAS_LOG]->(l)
DELETE old
WITH l
OPTIONAL MATCH (t:Task {pg_id: $task_pg_id})
FOREACH (_ IN CASE WHEN t IS NULL THEN [] ELSE [1] END |
    MERGE (t)-[:HAS_LOG]->(l)
)
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = log.Id.ToString(),
                ["task_pg_id"] = log.TaskId.ToString(),
                ["note"] = log.Note,
                ["actual_duration"] = log.ActualDuration,
                ["completed_at"] = ToIsoNullable(log.CompletedAt),
                ["comprehension_level"] = log.ComprehensionLevel,
                ["difficulty_level"] = log.DifficultyLevel,
                ["timer_start_at"] = ToIsoNullable(log.TimerStartAt),
                ["timer_end_at"] = ToIsoNullable(log.TimerEndAt),
                ["earned_value"] = log.EarnedValue,
                ["created_at"] = ToIso(log.CreatedAt),
                ["updated_at"] = ToIsoNullable(log.UpdatedAt)
            });
        }

        public async Task SyncScheduleAsync(int scheduleId)
        {
            var schedule = await _dbContext.Schedules
                .AsNoTracking()
                .Where(s => s.Id == scheduleId)
                .Select(s => new
                {
                    s.Id,
                    s.RoutineId,
                    DayOfWeek = s.DayOfWeek.ToString(),
                    StartTime = s.StartTime.HasValue ? s.StartTime.Value.ToString("HH:mm:ss") : null,
                    s.Duration,
                    s.Location,
                    s.CreatedAt,
                    s.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (schedule == null)
            {
                await DeleteScheduleAsync(scheduleId);
                return;
            }

            var query = @"
MERGE (s:Schedule {pg_id: $pg_id})
SET s.day_of_week = $day_of_week,
    s.start_time = $start_time,
    s.duration = $duration,
    s.location = $location,
    s.created_at = CASE WHEN s.created_at IS NULL THEN datetime($created_at) ELSE s.created_at END,
    s.updated_at = CASE WHEN $updated_at IS NULL THEN datetime() ELSE datetime($updated_at) END
WITH s
OPTIONAL MATCH (:Routine)-[old:HAS_SCHEDULE]->(s)
DELETE old
WITH s
OPTIONAL MATCH (r:Routine {pg_id: $routine_pg_id})
FOREACH (_ IN CASE WHEN r IS NULL THEN [] ELSE [1] END |
    MERGE (r)-[:HAS_SCHEDULE]->(s)
)
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = schedule.Id.ToString(),
                ["routine_pg_id"] = schedule.RoutineId?.ToString(),
                ["day_of_week"] = schedule.DayOfWeek,
                ["start_time"] = schedule.StartTime,
                ["duration"] = schedule.Duration,
                ["location"] = schedule.Location,
                ["created_at"] = ToIso(schedule.CreatedAt),
                ["updated_at"] = ToIsoNullable(schedule.UpdatedAt)
            });
        }

        public async Task SyncAssetAsync(int assetId)
        {
            var asset = await _dbContext.Assets
                .AsNoTracking()
                .Where(a => a.Id == assetId)
                .Select(a => new
                {
                    a.Id,
                    a.UserId,
                    a.FileName,
                    a.Url,
                    Type = a.Type.ToString(),
                    a.Extension,
                    a.FileSize,
                    Status = a.Status.ToString(),
                    a.CreatedAt,
                    a.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (asset == null)
            {
                await DeleteAssetAsync(assetId);
                return;
            }

            var query = @"
MERGE (u:User {pg_id: $user_pg_id})
MERGE (a:Asset {pg_id: $pg_id})
SET a.file_name = $file_name,
    a.url = $url,
    a.type = $type,
    a.extension = $extension,
    a.file_size = $file_size,
    a.status = $status,
    a.created_at = CASE WHEN a.created_at IS NULL THEN datetime($created_at) ELSE a.created_at END,
    a.updated_at = CASE WHEN $updated_at IS NULL THEN datetime() ELSE datetime($updated_at) END
WITH u, a
OPTIONAL MATCH (:User)-[old:OWNS_ASSET]->(a)
DELETE old
MERGE (u)-[:OWNS_ASSET]->(a)
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = asset.Id.ToString(),
                ["user_pg_id"] = asset.UserId.ToString(),
                ["file_name"] = asset.FileName,
                ["url"] = asset.Url,
                ["type"] = asset.Type,
                ["extension"] = asset.Extension,
                ["file_size"] = asset.FileSize,
                ["status"] = asset.Status,
                ["created_at"] = ToIso(asset.CreatedAt),
                ["updated_at"] = ToIsoNullable(asset.UpdatedAt)
            });
        }

        public async Task SyncAssetLinkAsync(int assetLinkId)
        {
            var assetLink = await _dbContext.AssetLinks
                .AsNoTracking()
                .Where(al => al.Id == assetLinkId)
                .Select(al => new
                {
                    al.Id,
                    al.AssetId,
                    al.LinkedId,
                    al.LinkedType
                })
                .FirstOrDefaultAsync();

            if (assetLink == null)
            {
                await DeleteAssetLinkAsync(assetLinkId);
                return;
            }

            // Ensure both ends exist in Neo4j before creating the LINKED_TO relation.
            await SyncAssetAsync(assetLink.AssetId);
            await EnsureAssetLinkTargetSyncedAsync(assetLink.LinkedType, assetLink.LinkedId);

            var targetLabel = GetAssetLinkTargetLabel(assetLink.LinkedType);
            var query = $@"
MATCH (a:Asset)
WHERE toString(a.pg_id) = $asset_pg_id
MATCH (target:{targetLabel})
WHERE toString(target.pg_id) = $linked_pg_id
OPTIONAL MATCH ()-[old:LINKED_TO]-()
WHERE toString(old.asset_link_pg_id) = $asset_link_pg_id
DELETE old
MERGE (a)-[rel:LINKED_TO {{asset_link_pg_id: $asset_link_pg_id}}]->(target)
SET rel.asset_link_pg_id = $asset_link_pg_id,
    rel.linked_type = $linked_type,
    rel.created_at = coalesce(rel.created_at, datetime()),
    rel.updated_at = datetime()
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["asset_link_pg_id"] = assetLink.Id.ToString(),
                ["asset_pg_id"] = assetLink.AssetId.ToString(),
                ["linked_pg_id"] = assetLink.LinkedId.ToString(),
                ["linked_type"] = assetLink.LinkedType.ToString()
            });
        }

        public Task DeleteUserAsync(int userId)
        {
            return DeleteNodeAsync("User", userId);
        }

        public Task DeleteStudyPlanAsync(int studyPlanId)
        {
            return DeleteNodeAsync("StudyPlan", studyPlanId);
        }

        public Task DeleteCourseAsync(int courseId)
        {
            return DeleteNodeAsync("Course", courseId);
        }

        public Task DeletePhaseAsync(int phaseId)
        {
            return DeleteNodeAsync("Phase", phaseId);
        }

        public Task DeleteRoutineAsync(int routineId)
        {
            return DeleteNodeAsync("Routine", routineId);
        }

        public Task DeleteTaskAsync(int taskId)
        {
            return DeleteNodeAsync("Task", taskId);
        }

        public Task DeleteLogAsync(int logId)
        {
            return DeleteNodeAsync("Log", logId);
        }

        public Task DeleteScheduleAsync(int scheduleId)
        {
            return DeleteNodeAsync("Schedule", scheduleId);
        }

        public Task DeleteAssetAsync(int assetId)
        {
            return DeleteNodeAsync("Asset", assetId);
        }

        public async Task DeleteAssetLinkAsync(int assetLinkId)
        {
            var query = @"
MATCH ()-[rel:LINKED_TO]-()
WHERE toString(rel.asset_link_pg_id) = $asset_link_pg_id
DELETE rel
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["asset_link_pg_id"] = assetLinkId.ToString()
            });
        }

        private Task EnsureAssetLinkTargetSyncedAsync(AssetLinkType linkedType, int linkedId)
        {
            return linkedType switch
            {
                AssetLinkType.StudyPlan => SyncStudyPlanAsync(linkedId),
                AssetLinkType.Course => SyncCourseAsync(linkedId),
                AssetLinkType.Task => SyncTaskAsync(linkedId),
                AssetLinkType.Log => SyncLogAsync(linkedId),
                AssetLinkType.ExternalLink => Task.CompletedTask,
                _ => Task.CompletedTask
            };
        }

        private async Task DeleteNodeAsync(string nodeLabel, int pgId)
        {
            var query = $@"
MATCH (n:{nodeLabel} {{pg_id: $pg_id}})
DETACH DELETE n
";

            await ExecuteAsync(query, new Dictionary<string, object?>
            {
                ["pg_id"] = pgId.ToString()
            });
        }

        private async Task ExecuteAsync(string query, Dictionary<string, object?> parameters)
        {
            await using var session = _driver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(query, parameters);
            });
        }

        private static string GetAssetLinkTargetLabel(AssetLinkType linkedType)
        {
            return linkedType switch
            {
                AssetLinkType.StudyPlan => "StudyPlan",
                AssetLinkType.Course => "Course",
                AssetLinkType.Task => "Task",
                AssetLinkType.Log => "Log",
                AssetLinkType.ExternalLink => "ExternalLink",
                _ => throw new ArgumentOutOfRangeException(nameof(linkedType), linkedType, "Unsupported AssetLinkType")
            };
        }

        private static string ToIso(DateTime value)
        {
            return value.ToUniversalTime().ToString("O");
        }

        private static string? ToIsoNullable(DateTime? value)
        {
            return value.HasValue ? value.Value.ToUniversalTime().ToString("O") : null;
        }
    }
}
