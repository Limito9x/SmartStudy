using Microsoft.EntityFrameworkCore;
using Neo4j.Driver;
using SmartStudy.Server.Data;

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

        public async Task SyncStudyPlanScopeAsync(int userId)
        {
            var user = await _dbContext.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return;
            }

            var studyPlanRows = await _dbContext.StudyPlans
                .AsNoTracking()
                .Where(sp => sp.UserId == userId && sp.DeletedAt == null)
                .Select(sp => new
                {
                    sp.Id,
                    sp.Name,
                    Status = sp.Status.ToString(),
                    Type = sp.Type.ToString(),
                    sp.StartDate,
                    sp.EndDate,
                    sp.CreatedAt,
                    sp.UpdatedAt
                })
                .ToListAsync();

            var studyPlans = studyPlanRows
                .Select(sp => new Dictionary<string, object?>
                {
                    ["pg_id"] = sp.Id.ToString(),
                    ["name"] = sp.Name,
                    ["status"] = sp.Status,
                    ["type"] = sp.Type,
                    ["start_date"] = sp.StartDate.ToUniversalTime().ToString("O"),
                    ["end_date"] = sp.EndDate.HasValue ? sp.EndDate.Value.ToUniversalTime().ToString("O") : null,
                    ["created_at"] = sp.CreatedAt.ToUniversalTime().ToString("O"),
                    ["updated_at"] = sp.UpdatedAt.HasValue ? sp.UpdatedAt.Value.ToUniversalTime().ToString("O") : null
                })
                .ToList();

            var query = @"
MERGE (u:User {pg_id: $user_pg_id})
ON CREATE SET u.created_at = datetime()
SET u.full_name = $full_name,
    u.email = $email,
    u.updated_at = datetime()
WITH u
OPTIONAL MATCH (u)-[old:OWNS_PLAN]->(:StudyPlan)
DELETE old
WITH u
UNWIND $study_plans AS row
MERGE (sp:StudyPlan {pg_id: row.pg_id})
SET sp.name = row.name,
    sp.status = row.status,
    sp.type = row.type,
    sp.start_date = datetime(row.start_date),
    sp.end_date = CASE WHEN row.end_date IS NULL THEN NULL ELSE datetime(row.end_date) END,
    sp.created_at = CASE WHEN row.created_at IS NULL THEN sp.created_at ELSE datetime(row.created_at) END,
    sp.updated_at = CASE WHEN row.updated_at IS NULL THEN datetime() ELSE datetime(row.updated_at) END
MERGE (u)-[:OWNS_PLAN]->(sp)
";

            var parameters = new Dictionary<string, object?>
            {
                ["user_pg_id"] = user.Id.ToString(),
                ["full_name"] = user.FullName,
                ["email"] = user.Email,
                ["study_plans"] = studyPlans
            };

            await using var session = _driver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(query, parameters);
            });
        }

        public async Task SyncCourseScopeAsync(int studyPlanId)
        {
            var studyPlanExists = await _dbContext.StudyPlans
                .AsNoTracking()
                .AnyAsync(sp => sp.Id == studyPlanId && sp.DeletedAt == null);

            if (!studyPlanExists)
            {
                return;
            }

            var courseRows = await _dbContext.Courses
                .AsNoTracking()
                .Where(c => c.StudyPlanId == studyPlanId && c.DeletedAt == null)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    Status = c.Status.ToString(),
                    c.Color,
                    c.Goal,
                    c.TargetScore,
                    c.FinalScore,
                    c.CreatedAt,
                    c.UpdatedAt
                })
                .ToListAsync();

            var courses = courseRows
                .Select(c => new Dictionary<string, object?>
                {
                    ["pg_id"] = c.Id.ToString(),
                    ["name"] = c.Name,
                    ["status"] = c.Status,
                    ["color"] = c.Color,
                    ["goal"] = c.Goal,
                    ["target_score"] = c.TargetScore,
                    ["final_score"] = c.FinalScore,
                    ["created_at"] = c.CreatedAt.ToUniversalTime().ToString("O"),
                    ["updated_at"] = c.UpdatedAt.HasValue ? c.UpdatedAt.Value.ToUniversalTime().ToString("O") : null
                })
                .ToList();

            var query = @"
MERGE (sp:StudyPlan {pg_id: $study_plan_pg_id})
WITH sp
OPTIONAL MATCH (sp)-[old:HAS_COURSE]->(:Course)
DELETE old
WITH sp
UNWIND $courses AS row
MERGE (c:Course {pg_id: row.pg_id})
SET c.name = row.name,
    c.status = row.status,
    c.color = row.color,
    c.goal = row.goal,
    c.target_score = row.target_score,
    c.final_score = row.final_score,
    c.created_at = CASE WHEN row.created_at IS NULL THEN c.created_at ELSE datetime(row.created_at) END,
    c.updated_at = CASE WHEN row.updated_at IS NULL THEN datetime() ELSE datetime(row.updated_at) END,
    c.study_plan_pg_id = $study_plan_pg_id
MERGE (sp)-[:HAS_COURSE]->(c)
";

            var parameters = new Dictionary<string, object?>
            {
                ["study_plan_pg_id"] = studyPlanId.ToString(),
                ["courses"] = courses
            };

            await using var session = _driver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(query, parameters);
            });
        }

        public async Task SyncRoutineAndTaskScopeAsync(int courseId)
        {
            var courseExists = await _dbContext.Courses
                .AsNoTracking()
                .AnyAsync(c => c.Id == courseId && c.DeletedAt == null);

            if (!courseExists)
            {
                return;
            }

            var routineRows = await _dbContext.Routines
                .AsNoTracking()
                .Where(r => r.CourseId == courseId && r.DeletedAt == null)
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    Type = r.Type.ToString(),
                    r.IsActive,
                    r.StartDate,
                    r.EndDate,
                    r.CreatedAt,
                    r.UpdatedAt
                })
                .ToListAsync();

            var routines = routineRows
                .Select(r => new Dictionary<string, object?>
                {
                    ["pg_id"] = r.Id.ToString(),
                    ["name"] = r.Name,
                    ["type"] = r.Type,
                    ["is_active"] = r.IsActive,
                    ["start_date"] = r.StartDate.ToUniversalTime().ToString("O"),
                    ["end_date"] = r.EndDate.HasValue ? r.EndDate.Value.ToUniversalTime().ToString("O") : null,
                    ["created_at"] = r.CreatedAt.ToUniversalTime().ToString("O"),
                    ["updated_at"] = r.UpdatedAt.HasValue ? r.UpdatedAt.Value.ToUniversalTime().ToString("O") : null,
                    ["course_pg_id"] = courseId.ToString()
                })
                .ToList();

            var taskRows = await _dbContext.Tasks
                .AsNoTracking()
                .Where(t => t.CourseId == courseId && t.DeletedAt == null)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    Status = t.Status.ToString(),
                    Type = t.Type.ToString(),
                    t.StartDateTime,
                    t.EndDateTime,
                    t.RoutineId,
                    t.CreatedAt,
                    t.UpdatedAt
                })
                .ToListAsync();

            var tasks = taskRows
                .Select(t => new Dictionary<string, object?>
                {
                    ["pg_id"] = t.Id.ToString(),
                    ["name"] = t.Name,
                    ["status"] = t.Status,
                    ["type"] = t.Type,
                    ["start_datetime"] = t.StartDateTime.HasValue ? t.StartDateTime.Value.ToUniversalTime().ToString("O") : null,
                    ["end_datetime"] = t.EndDateTime.HasValue ? t.EndDateTime.Value.ToUniversalTime().ToString("O") : null,
                    ["routine_pg_id"] = t.RoutineId.HasValue ? t.RoutineId.Value.ToString() : null,
                    ["created_at"] = t.CreatedAt.ToUniversalTime().ToString("O"),
                    ["updated_at"] = t.UpdatedAt.HasValue ? t.UpdatedAt.Value.ToUniversalTime().ToString("O") : null,
                    ["course_pg_id"] = courseId.ToString()
                })
                .ToList();

            var query = @"
MERGE (c:Course {pg_id: $course_pg_id})
WITH c
OPTIONAL MATCH (c)-[oldRoutine:HAS_ROUTINE]->(:Routine)
DELETE oldRoutine
WITH c
OPTIONAL MATCH (c)-[oldTask:HAS_TASK]->(:Task)
DELETE oldTask
WITH c
OPTIONAL MATCH (rOld:Routine {course_pg_id: $course_pg_id})-[oldContains:CONTAINS_TASK]->(:Task {course_pg_id: $course_pg_id})
DELETE oldContains
WITH c
UNWIND $routines AS routineRow
MERGE (r:Routine {pg_id: routineRow.pg_id})
SET r.name = routineRow.name,
    r.type = routineRow.type,
    r.is_active = routineRow.is_active,
    r.start_date = datetime(routineRow.start_date),
    r.end_date = CASE WHEN routineRow.end_date IS NULL THEN NULL ELSE datetime(routineRow.end_date) END,
    r.created_at = CASE WHEN routineRow.created_at IS NULL THEN r.created_at ELSE datetime(routineRow.created_at) END,
    r.updated_at = CASE WHEN routineRow.updated_at IS NULL THEN datetime() ELSE datetime(routineRow.updated_at) END,
    r.course_pg_id = $course_pg_id
MERGE (c)-[:HAS_ROUTINE]->(r)
WITH c
UNWIND $tasks AS taskRow
MERGE (t:Task {pg_id: taskRow.pg_id})
SET t.name = taskRow.name,
    t.status = taskRow.status,
    t.type = taskRow.type,
    t.start_datetime = CASE WHEN taskRow.start_datetime IS NULL THEN NULL ELSE datetime(taskRow.start_datetime) END,
    t.end_datetime = CASE WHEN taskRow.end_datetime IS NULL THEN NULL ELSE datetime(taskRow.end_datetime) END,
    t.created_at = CASE WHEN taskRow.created_at IS NULL THEN t.created_at ELSE datetime(taskRow.created_at) END,
    t.updated_at = CASE WHEN taskRow.updated_at IS NULL THEN datetime() ELSE datetime(taskRow.updated_at) END,
    t.course_pg_id = $course_pg_id,
    t.routine_pg_id = taskRow.routine_pg_id
MERGE (c)-[:HAS_TASK]->(t)
WITH taskRow, t
WHERE taskRow.routine_pg_id IS NOT NULL
MATCH (r:Routine {pg_id: taskRow.routine_pg_id})
MERGE (r)-[:CONTAINS_TASK]->(t)
";

            var parameters = new Dictionary<string, object?>
            {
                ["course_pg_id"] = courseId.ToString(),
                ["routines"] = routines,
                ["tasks"] = tasks
            };

            await using var session = _driver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(query, parameters);
            });
        }

        public async Task SyncLogScopeAsync(int taskId)
        {
            var taskExists = await _dbContext.Tasks
                .AsNoTracking()
                .AnyAsync(t => t.Id == taskId && t.DeletedAt == null);

            if (!taskExists)
            {
                return;
            }

            var logRows = await _dbContext.Logs
                .AsNoTracking()
                .Where(l => l.TaskId == taskId && l.DeletedAt == null)
                .Select(l => new
                {
                    l.Id,
                    l.Note,
                    l.ActualDuration,
                    l.CompletedAt,
                    l.CreatedAt,
                    l.UpdatedAt
                })
                .ToListAsync();

            var logs = logRows
                .Select(l => new Dictionary<string, object?>
                {
                    ["pg_id"] = l.Id.ToString(),
                    ["note"] = l.Note,
                    ["actual_duration"] = l.ActualDuration,
                    ["completed_at"] = l.CompletedAt.HasValue ? l.CompletedAt.Value.ToUniversalTime().ToString("O") : null,
                    ["created_at"] = l.CreatedAt.ToUniversalTime().ToString("O"),
                    ["updated_at"] = l.UpdatedAt.HasValue ? l.UpdatedAt.Value.ToUniversalTime().ToString("O") : null,
                    ["task_pg_id"] = taskId.ToString()
                })
                .ToList();

            var query = @"
MERGE (t:Task {pg_id: $task_pg_id})
WITH t
OPTIONAL MATCH (t)-[old:HAS_LOG]->(:Log)
DELETE old
WITH t
UNWIND $logs AS row
MERGE (l:Log {pg_id: row.pg_id})
SET l.note = row.note,
    l.actual_duration = row.actual_duration,
    l.completed_at = CASE WHEN row.completed_at IS NULL THEN NULL ELSE datetime(row.completed_at) END,
    l.created_at = CASE WHEN row.created_at IS NULL THEN l.created_at ELSE datetime(row.created_at) END,
    l.updated_at = CASE WHEN row.updated_at IS NULL THEN datetime() ELSE datetime(row.updated_at) END,
    l.task_pg_id = $task_pg_id
MERGE (t)-[:HAS_LOG]->(l)
";

            var parameters = new Dictionary<string, object?>
            {
                ["task_pg_id"] = taskId.ToString(),
                ["logs"] = logs
            };

            await using var session = _driver.AsyncSession();
            await session.ExecuteWriteAsync(async tx =>
            {
                await tx.RunAsync(query, parameters);
            });
        }
    }
}