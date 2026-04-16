using Hangfire;
using Mapster;
using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Constants;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Exceptions;
using SmartStudy.Server.Helpers;
using SmartStudy.Server.Jobs;

namespace SmartStudy.Server.Services;

public interface IPlanTemplateService
{
    // CRUD cơ bản — đã có
    Task<PlanTemplateDto> CreateFromPlanAsync(CreatePlanTemplateDto dto);
    Task<PagedResult<PlanTemplateDto>> GetTemplatesAsync(TemplateQueryParams queryParams);
    Task<PlanTemplateDetailDto> GetByIdAsync(int templateId);
    Task<PlanTemplateDto> UpdateAsync(int templateId, UpdatePlanTemplateDto dto);
    Task<bool> DeleteAsync(int templateId);

    // Còn thiếu — quan trọng
    Task<ResponseStudyPlanDto> CloneToStudyPlanAsync(CloneTemplateDto dto);
    // ↑ Core feature — user clone template thành plan thật

    Task<ImportSelectedCoursesResultDto> ImportSelectedCoursesAsync(ImportSelectedCoursesDto dto);

    Task<List<PlanTemplateDto>> GetMyTemplatesAsync();
    // ↑ Phân biệt template của mình vs public templates của người khác
}
public class PlanTemplateService: IPlanTemplateService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    
    public PlanTemplateService(ApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }
    
    private async Task<TemplatePayload> BuildPayloadAsync(int sourcePlanId)
    {
        var plan = await _context.StudyPlans
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == sourcePlanId)
            ?? throw new KeyNotFoundException("Không tìm thấy kế hoạch học tập");

        var courses = await _context.Courses
            .AsNoTracking()
            .Where(c => c.StudyPlanId == sourcePlanId)
            .Include(c => c.Subject)
            .Include(c => c.Phases)
                .ThenInclude(ph => ph.Routines)
                    .ThenInclude(r => r.Schedules)
            .Include(c => c.Phases)
                .ThenInclude(ph => ph.Tasks)
            .ToListAsync();

        var studentInfo = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == plan.UserId)
            .Select(u => new
            {
                University = u.StudentInfo != null ? u.StudentInfo.University : null,
                Major = u.StudentInfo != null ? u.StudentInfo.Major : null,
                Cohort = u.StudentInfo != null ? u.StudentInfo.Cohort : null
            })
            .FirstOrDefaultAsync();
        
        var planStart = plan.StartDate;
        var planDurationDays = plan.EndDate.HasValue
            ? (int)(plan.EndDate.Value - planStart).TotalDays
            : 112; // default 16 tuần

        var tags = BuildTemplateTags(
            studentInfo?.University,
            studentInfo?.Major,
            studentInfo?.Cohort
        );

        return new TemplatePayload
        {
            PayloadVersion = 2,
            DurationDays = planDurationDays,
            Tags = tags,
            Courses = courses
                .Select(c => new TemplateCourse
                {
                    Ref = $"course-{c.Id}",
                    Name = c.Name,
                    Goal = c.Goal,
                    TargetScore = c.TargetScore,
                    Subject = c.Subject != null ? new TemplateSubject
                    {
                        Name = c.Subject.Name,
                        Code = c.Subject.Code,
                        Credits = c.Subject.Credits,
                    } : null,
                    Phases = c.Phases
                        .Where(ph => !ph.IsDeleted)
                        .OrderBy(ph => ph.StartDateTime)
                        .Select(ph => new TemplatePhase
                        {
                            Ref = $"phase-{ph.Id}",
                            Title = ph.Title,
                            Type = ph.Type,
                            Priority = ph.Priority,
                            Notes = ph.Notes,
                            StartDayOffset = ph.StartDateTime.HasValue
                                ? (int)(ph.StartDateTime.Value.Date - planStart.Date).TotalDays
                                : 0,
                            EndDayOffset = ph.EndDateTime.HasValue
                                ? (int)(ph.EndDateTime.Value.Date - planStart.Date).TotalDays
                                : null,
                            Routines = ph.Routines
                                .Where(r => !r.IsDeleted)
                                .Select(r => new TemplateRoutine
                                {
                                    Name = r.Name,
                                    Type = r.Type,
                                    StartDayOffset = (int)(r.StartDate.Date - planStart.Date).TotalDays,
                                    EndDayOffset = r.EndDate.HasValue
                                        ? (int)(r.EndDate.Value.Date - planStart.Date).TotalDays
                                        : null,
                                    Schedules = r.Schedules
                                        .Select(s => new TemplateSchedule
                                        {
                                            DayOfWeek = s.DayOfWeek,
                                            StartTime = s.StartTime,
                                            Duration = s.Duration,
                                        }).ToList()
                                }).ToList(),
                            Tasks = ph.Tasks
                                .Where(t => !t.IsDeleted && t.Type == TaskType.Milestone)
                                .Select(t => new TemplateTask
                                {
                                    Name = t.Name,
                                    Type = t.Type,
                                    Description = t.Description,
                                    StartDayOffset = t.StartDateTime.HasValue
                                        ? (int)(t.StartDateTime.Value.Date - planStart.Date).TotalDays
                                        : 0,
                                    EndDayOffset = t.EndDateTime.HasValue
                                        ? (int)(t.EndDateTime.Value.Date - planStart.Date).TotalDays
                                        : null
                                }).ToList()
                        }).ToList(),
                    // Legacy compatibility for old consumers.
                    Routines = []
                }).ToList()
        };
    }

    public async Task<PlanTemplateDto> CreateFromPlanAsync(CreatePlanTemplateDto dto)
    {
        var userId = _currentUserService.UserId;
        var payload = await BuildPayloadAsync(dto.SourcePlanId);
        var sourcePlan = await _context.StudyPlans
            .Where(p => p.Id == dto.SourcePlanId)
            .Select(p => new
            {
                p.Name,
                p.Type
            })
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Không tìm thấy kế hoạch học tập nguồn");
        
        // Upsert — nếu đã có template từ plan này thì update
        var existing = await _context.PlanTemplates
            .FirstOrDefaultAsync(t => t.SourcePlanId == dto.SourcePlanId
                                      && t.CreatedById == userId);
        if (existing != null)
        {
            existing.Payload = payload;
            existing.Name = dto.Name ?? existing.Name;
            existing.Description = dto.Description ?? existing.Description;
        }
        else
        {
            var template = new PlanTemplate
            {
                Name = dto.Name ?? sourcePlan.Name,
                Type = sourcePlan.Type,
                Description = dto.Description,
                IsPublic = dto.IsPublic,
                CreatedById = userId,
                SourcePlanId = dto.SourcePlanId,
                Payload = payload,
            };
            _context.PlanTemplates.Add(template);
        }

        await _context.SaveChangesAsync();

        var savedTemplate = existing
            ?? await _context.PlanTemplates
                .Include(t => t.CreatedBy)
                .OrderByDescending(t => t.CreatedAt)
                .FirstAsync(t => t.SourcePlanId == dto.SourcePlanId
                                 && t.CreatedById == userId);

        return MapToTemplateDto(savedTemplate);
    }

    public async Task<List<PlanTemplateDto>> GetMyTemplatesAsync()
    {
        var userId = _currentUserService.UserId;
        var templates = await _context.PlanTemplates
            .AsNoTracking()
            .Where(t => t.CreatedById == userId)
            .Include(t => t.CreatedBy)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var templateIds = templates.Select(t => t.Id).ToList();
        var cloneCountLookup = templateIds.Count == 0
            ? new Dictionary<int, int>()
            : await _context.StudyPlans
                .AsNoTracking()
                .Where(sp => sp.TemplateId.HasValue && templateIds.Contains(sp.TemplateId.Value))
                .GroupBy(sp => sp.TemplateId!.Value)
                .Select(g => new { TemplateId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.TemplateId, x => x.Count);
        
        return templates
            .Select(t => MapToTemplateDto(t, cloneCountLookup.GetValueOrDefault(t.Id)))
            .ToList();
    }

    public async Task<PlanTemplateDetailDto> GetByIdAsync(int templateId)
    {
        var template = _context.PlanTemplates
            .Include(t => t.SourcePlan)
            .FirstOrDefault(t => t.Id == templateId)
            ?? throw new KeyNotFoundException("Không tìm thấy template");
        
        

        var compatiblePayload = EnsurePayloadCompatibility(template.Payload);
        var payloadCourses = compatiblePayload.Courses ?? [];
        var cloneCount = await _context.StudyPlans
            .AsNoTracking()
            .CountAsync(sp => sp.TemplateId == template.Id);

        var tags = compatiblePayload.Tags ?? [];
        var majorTag = ExtractTagValue(tags, "major");
        var phaseCount = payloadCourses
            .Sum(c => c.Phases?.Count ?? 0);
        var milestoneCount = payloadCourses
            .Sum(c => c.Phases?.Sum(ph => ph.Tasks?.Count(t => t.Type == TaskType.Milestone) ?? 0) ?? 0);
        var phasePreviewNames = payloadCourses
            .SelectMany(c => c.Phases ?? [])
            .Select(ph => ph.Title)
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(3)
            .ToList();

        var dto = new PlanTemplateDetailDto()
        {
            Id = templateId,
            Name = template.Name,
            Description = template.Description,
            IsPublic = template.IsPublic,
            CreatedAt = template.CreatedAt,
            CreatedByName = (await _context.Users.FindAsync(template.CreatedById))?.FullName,
            SourcePlanId = template.SourcePlanId,
            CourseCount = payloadCourses.Count,
            RoutineCount = payloadCourses
                .Sum(c => c.Phases.Sum(ph => ph.Routines.Count) + (c.Routines?.Count ?? 0)),
            PhaseCount = phaseCount,
            MilestoneCount = milestoneCount,
            CloneCount = cloneCount,
            DurationDays = compatiblePayload.DurationDays,
            Type = template.Type,
            Tags = tags,
            CoursePreviewNames = payloadCourses
                .Select(c => c.Name)
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(3)
                .ToList(),
            PhasePreviewNames = phasePreviewNames,
            UniversityTag = ExtractTagValue(tags, "university"),
            MajorTag = majorTag,
            ContextTag = majorTag,
            Courses = BuildDetailCourses(compatiblePayload)
        };
        
        if (template.IsPublic) return dto;
        
        return template.CreatedById != _currentUserService.UserId 
            ? throw new UnauthorizedAccessException("Bạn không có quyền xem template này") 
            : dto;
    }

    public async Task<PagedResult<PlanTemplateDto>> GetTemplatesAsync(TemplateQueryParams queryParams)
    {
        var query = _context.PlanTemplates
            .AsNoTracking()
            .Include(t => t.CreatedBy)
            .AsQueryable();

        var isAdmin = _currentUserService.IsAdmin;
        if (!isAdmin)
        {
            query = query.Where(t => t.IsPublic);
        }
        else
        {
            // Lấy từ template public và của admin tạo
            query = query.Where(t => t.IsPublic || t.CreatedById == _currentUserService.UserId);
        }

        if (queryParams.Type.HasValue)
        {
            query = queryParams.Type.Value switch
            {
                StudyPlanType.Academic => query.Where(t => t.Type == StudyPlanType.Academic),
                StudyPlanType.Personal => query.Where(t => t.Type == StudyPlanType.Personal),
                _ => query
            };
        }
        
        if(!String.IsNullOrWhiteSpace(queryParams.SearchTerm))
        {
            var searchLower = queryParams.SearchTerm.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(searchLower) 
                                     || (t.Description != null && t.Description.ToLower().Contains(searchLower)));
        }

        var allCandidates = await query.ToListAsync();

        var studentInfo = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == _currentUserService.UserId)
            .Select(u => new
            {
                University = u.StudentInfo != null ? u.StudentInfo.University : null,
                Major = u.StudentInfo != null ? u.StudentInfo.Major : null,
                Cohort = u.StudentInfo != null ? u.StudentInfo.Cohort : null
            })
            .FirstOrDefaultAsync();

        var ranked = allCandidates
            .OrderByDescending(t => ComputeTemplateRank(t, studentInfo?.University, studentInfo?.Major, studentInfo?.Cohort))
            .ThenByDescending(t => t.CreatedAt)
            .ToList();

        var totalCount = ranked.Count;
        var pageItems = ranked
            .Skip(queryParams.PageIndex * queryParams.PageSize)
            .Take(queryParams.PageSize)
            .ToList();

        var templateIds = pageItems.Select(t => t.Id).ToList();
        var cloneCountLookup = templateIds.Count == 0
            ? new Dictionary<int, int>()
            : await _context.StudyPlans
                .AsNoTracking()
                .Where(sp => sp.TemplateId.HasValue && templateIds.Contains(sp.TemplateId.Value))
                .GroupBy(sp => sp.TemplateId!.Value)
                .Select(g => new { TemplateId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.TemplateId, x => x.Count);

        var dtoItems = pageItems
            .Select(t => MapToTemplateDto(t, cloneCountLookup.GetValueOrDefault(t.Id)))
            .ToList();

        return new PagedResult<PlanTemplateDto>
        {
            Items = dtoItems,
            TotalCount = totalCount,
            PageIndex = queryParams.PageIndex,
            PageSize = queryParams.PageSize,
        };
    }

    public async Task<PlanTemplateDto> UpdateAsync(int templateId, UpdatePlanTemplateDto dto)
    {
        var template = await _context.PlanTemplates
                           .FirstOrDefaultAsync(t => t.Id == templateId)
                       ?? throw new KeyNotFoundException("Không tìm thấy template");

        if (template.CreatedById != _currentUserService.UserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa template này");
        }

        template.Name = dto.Name;
        template.Description = dto.Description;
        template.IsPublic = dto.IsPublic;

        await _context.SaveChangesAsync();

        await _context.Entry(template)
            .Reference(t => t.CreatedBy)
            .LoadAsync();

        var cloneCount = await _context.StudyPlans
            .AsNoTracking()
            .CountAsync(sp => sp.TemplateId == template.Id);
        return MapToTemplateDto(template, cloneCount);
    }

    public async Task<bool> DeleteAsync(int templateId)
    {
        var template = await _context.PlanTemplates
                           .FirstOrDefaultAsync(t => t.Id == templateId)
                       ?? throw new KeyNotFoundException("Không tìm thấy template");

        if (template.CreatedById != _currentUserService.UserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa template này");
        }

        _context.PlanTemplates.Remove(template);
        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<ResponseStudyPlanDto> CloneToStudyPlanAsync(CloneTemplateDto dto)
{
    var userId = _currentUserService.UserId;

    var template = await _context.PlanTemplates
        .FirstOrDefaultAsync(t => t.Id == dto.TemplateId)
        ?? throw new KeyNotFoundException("Không tìm thấy template");

    if (!template.IsPublic && template.CreatedById != userId)
        throw new UnauthorizedAccessException("Không có quyền truy cập template này");

    var payload = EnsurePayloadCompatibility(template.Payload)
        ?? throw new AppException("Template không có dữ liệu");

    if (template.Type == StudyPlanType.Academic)
    {
        var hasActiveAcademicPlan = await _context.StudyPlans
            .AnyAsync(sp => sp.UserId == userId 
                            && sp.Type == StudyPlanType.Academic 
                            && sp.Status == StudyPlanStatus.Active);
        if (hasActiveAcademicPlan)
            throw new AppException("Bạn đã có kế hoạch học tập đại học đang hoạt động, không thể clone thêm.");
    }

    var startDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
    var endDate = startDate.AddDays(payload.DurationDays);
    
    var templateSubjects = payload.Courses
        .Where(c => c.Subject != null)
        .Select(c => c.Subject!)
        .GroupBy(s => s.Name)
        .Select(g => g.First())
        .ToList();
    
    var subjectNames = templateSubjects.Select(s => s.Name).ToList();
    
    var subjectDictionary = await _context.Subjects
        .Where(s=>s.UserId==userId && subjectNames.Contains(s.Name))
        .ToDictionaryAsync(s => s.Name, s => s);

    var subjectsToCreate = templateSubjects
        .Where(ts => !subjectDictionary.ContainsKey(ts.Name))
        .Select(ts => new Subject()
        {
            Name = ts.Name,
            Code = ts.Code,
            Credits = ts.Credits,
            UserId = userId,
            Type = template.Type
        })
        .ToList();
    
    if (subjectsToCreate.Any())
    {
        _context.Subjects.AddRange(subjectsToCreate);
        await _context.SaveChangesAsync(); // Kịch! Tụi nó đã có ID mới.

        // Bổ sung mấy cái mới này vào Dictionary luôn
        foreach (var newSub in subjectsToCreate)
        {
            subjectDictionary[newSub.Name] = newSub;
        }
    }
    
    // Bước 1 — Tạo plan + courses trước, chưa có routines
    var plan = new StudyPlan
    {
        Type = template.Type,
        Name = dto.Name ?? template.Name,
        UserId = userId,
        TemplateId = template.Id,
        StartDate = startDate,
        EndDate = endDate,
        Order = await _context.StudyPlans
            .CountAsync(p => p.UserId == userId) + 1,
        Courses = payload.Courses.Select(c => new Course
        {
            SubjectId = c.Subject != null && subjectDictionary.ContainsKey(c.Subject.Name)
                ? subjectDictionary[c.Subject.Name].Id
                : null,
            Name = c.Name,
            Goal = c.Goal,
            TargetScore = c.TargetScore,
            Status = CourseStatus.Enrolled,
        }).ToList()
    };

    _context.StudyPlans.Add(plan);
    await _context.SaveChangesAsync(); // ← plan và courses đã có ID

    // Bước 2 — Tạo phase/routine/task theo payload v2, fallback v1 nếu cần
    var createdRoutineIds = new List<int>();

    for (int i = 0; i < payload.Courses.Count; i++)
    {
        var templateCourse = payload.Courses[i];
        var course = plan.Courses[i];
        var phasesToCreate = templateCourse.Phases ?? [];

        if (phasesToCreate.Count == 0 && templateCourse.Routines.Count > 0)
        {
            phasesToCreate =
            [
                new TemplatePhase
                {
                    Title = "Giai đoạn chung",
                    Type = PhaseType.General,
                    Priority = PriorityLevel.Low,
                    StartDayOffset = 0,
                    EndDayOffset = payload.DurationDays,
                    Routines = templateCourse.Routines,
                    Tasks = []
                }
            ];
        }

        foreach (var templatePhase in phasesToCreate)
        {
            var phase = new Phase
            {
                CourseId = course.Id,
                Title = templatePhase.Title,
                Type = templatePhase.Type,
                Priority = templatePhase.Priority,
                Notes = templatePhase.Notes,
                StartDateTime = startDate.AddDays(templatePhase.StartDayOffset),
                EndDateTime = templatePhase.EndDayOffset.HasValue
                    ? startDate.AddDays(templatePhase.EndDayOffset.Value)
                    : null,
                Status = EventStatus.Pending
            };

            _context.Phases.Add(phase);
            await _context.SaveChangesAsync();

            var routines = templatePhase.Routines.Select(r => new Routine
            {
                Name = r.Name,
                Type = r.Type,
                UserId = userId,
                StudyPlanId = plan.Id,
                PhaseId = phase.Id,
                StartDate = startDate.AddDays(r.StartDayOffset),
                EndDate = r.EndDayOffset.HasValue
                    ? startDate.AddDays(r.EndDayOffset.Value)
                    : endDate,
                Schedules = r.Schedules.Select(s => new Schedule
                {
                    DayOfWeek = s.DayOfWeek,
                    StartTime = s.StartTime,
                    Duration = s.Duration,
                }).ToList()
            }).ToList();

            if (routines.Count > 0)
            {
                _context.Routines.AddRange(routines);
                await _context.SaveChangesAsync();
                createdRoutineIds.AddRange(routines.Select(r => r.Id));
            }

            var milestoneTasks = templatePhase.Tasks
                .Where(t => t.Type == TaskType.Milestone)
                .Select(t => new TaskItem
                {
                    Name = t.Name,
                    Description = t.Description,
                    Type = t.Type,
                    Status = SmartStudy.Server.Entities.Enums.TaskStatus.Pending,
                    UserId = userId,
                    PhaseId = phase.Id,
                    StartDateTime = startDate.AddDays(t.StartDayOffset),
                    EndDateTime = t.EndDayOffset.HasValue
                        ? startDate.AddDays(t.EndDayOffset.Value)
                        : startDate.AddDays(t.StartDayOffset)
                }).ToList();

            if (milestoneTasks.Count > 0)
            {
                _context.Tasks.AddRange(milestoneTasks);
                await _context.SaveChangesAsync();
            }
        }
    }

    foreach (var routineId in createdRoutineIds)
    {
        BackgroundJob.Enqueue<IRoutineTaskGenerator>((r) => r.GenerateForSingleRoutineAsync(routineId));
    }

    // Load lại để map DTO
    if (plan.Courses != null)
    {
        await _context.Entry(plan)
            .Collection(p => p.Courses!)
            .LoadAsync();
    }

    return plan.Adapt<ResponseStudyPlanDto>();
}

public async Task<ImportSelectedCoursesResultDto> ImportSelectedCoursesAsync(ImportSelectedCoursesDto dto)
{
    var userId = _currentUserService.UserId;

    var template = await _context.PlanTemplates
        .FirstOrDefaultAsync(t => t.Id == dto.TemplateId)
        ?? throw new KeyNotFoundException("Không tìm thấy template");

    if (!template.IsPublic && template.CreatedById != userId)
    {
        throw new UnauthorizedAccessException("Không có quyền truy cập template này");
    }

    var targetPlanId = dto.TargetPlanId;
    if (targetPlanId <= 0)
    {
        var candidatePlanIds = await _context.StudyPlans
            .AsNoTracking()
            .Where(sp => sp.UserId == userId
                         && sp.Type == template.Type
                         && sp.Status == StudyPlanStatus.Active)
            .Select(sp => sp.Id)
            .ToListAsync();

        if (candidatePlanIds.Count == 0)
        {
            throw new AppException("Không tìm thấy kế hoạch đang hoạt động phù hợp để import.");
        }

        if (candidatePlanIds.Count > 1)
        {
            throw new AppException("Có nhiều kế hoạch đang hoạt động cùng loại. Vui lòng chọn kế hoạch đích cụ thể.");
        }

        targetPlanId = candidatePlanIds[0];
    }

    var targetPlan = await _context.StudyPlans
        .Include(sp => sp.Courses!)
            .ThenInclude(c => c.Subject)
        .Include(sp => sp.Courses!)
            .ThenInclude(c => c.Phases)
                .ThenInclude(ph => ph.Routines)
        .Include(sp => sp.Courses!)
            .ThenInclude(c => c.Phases)
                .ThenInclude(ph => ph.Tasks)
        .FirstOrDefaultAsync(sp => sp.Id == targetPlanId)
        ?? throw new KeyNotFoundException("Không tìm thấy kế hoạch đích");

    if (targetPlan.UserId != userId)
    {
        throw new UnauthorizedAccessException("Bạn không có quyền import vào kế hoạch này");
    }

    if (targetPlan.Type != template.Type)
    {
        throw new AppException("Loại kế hoạch đích không tương thích với template.");
    }

    var payload = EnsurePayloadCompatibility(template.Payload)
        ?? throw new AppException("Template không có dữ liệu");
    var selectedRefSet = dto.CourseRefs
        .Where(r => !string.IsNullOrWhiteSpace(r))
        .Select(r => r.Trim())
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    if (selectedRefSet.Count == 0)
    {
        throw new AppException("Bạn chưa chọn môn học nào để import");
    }

    var selectedCourses = payload.Courses
        .Where(c =>
        {
            var courseRef = string.IsNullOrWhiteSpace(c.Ref)
                ? NormalizeTag(c.Name)
                : c.Ref;
            return selectedRefSet.Contains(courseRef)
                   || selectedRefSet.Contains(c.Name);
        })
        .ToList();

    if (selectedCourses.Count == 0)
    {
        throw new AppException("Không tìm thấy môn học tương ứng trong template");
    }

    var result = new ImportSelectedCoursesResultDto
    {
        TargetPlanId = targetPlan.Id,
    };

    var existingCourseByNormalizedName = (targetPlan.Courses ?? [])
        .Where(c => !string.IsNullOrWhiteSpace(c.Name))
        .GroupBy(c => NormalizeCourseName(c.Name))
        .ToDictionary(g => g.Key, g => g.First(), StringComparer.Ordinal);

    var subjectPool = await _context.Subjects
        .Where(s => s.UserId == userId)
        .ToListAsync();

    await using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        foreach (var templateCourse in selectedCourses)
        {
            var subject = await ResolveSubjectForImportAsync(
                templateCourse.Subject,
                template.Type,
                userId,
                subjectPool
            );

            var normalizedName = NormalizeCourseName(templateCourse.Name);
            var hasExistingCourse = existingCourseByNormalizedName.TryGetValue(normalizedName, out var targetCourse);

            if (!hasExistingCourse || targetCourse == null)
            {
                targetCourse = new Course
                {
                    StudyPlanId = targetPlan.Id,
                    Name = templateCourse.Name,
                    Goal = templateCourse.Goal,
                    TargetScore = templateCourse.TargetScore,
                    SubjectId = subject?.Id,
                    Status = CourseStatus.Enrolled,
                };
                _context.Courses.Add(targetCourse);
                await _context.SaveChangesAsync();

                result.CreatedCourseIds.Add(targetCourse.Id);
                existingCourseByNormalizedName[normalizedName] = targetCourse;
            }
            else
            {
                var updated = false;
                if (!targetCourse.SubjectId.HasValue && subject?.Id != null)
                {
                    targetCourse.SubjectId = subject.Id;
                    updated = true;
                }

                if (string.IsNullOrWhiteSpace(targetCourse.Goal) && !string.IsNullOrWhiteSpace(templateCourse.Goal))
                {
                    targetCourse.Goal = templateCourse.Goal;
                    updated = true;
                }

                if (!targetCourse.TargetScore.HasValue && templateCourse.TargetScore.HasValue)
                {
                    targetCourse.TargetScore = templateCourse.TargetScore;
                    updated = true;
                }

                if (updated)
                {
                    await _context.SaveChangesAsync();
                }
            }

            var phasesToImport = templateCourse.Phases ?? [];
            if (phasesToImport.Count == 0 && templateCourse.Routines.Count > 0)
            {
                phasesToImport =
                [
                    new TemplatePhase
                    {
                        Title = "Giai đoạn chung",
                        Type = PhaseType.General,
                        Priority = PriorityLevel.Low,
                        StartDayOffset = 0,
                        EndDayOffset = payload.DurationDays,
                        Routines = templateCourse.Routines,
                        Tasks = []
                    }
                ];
            }

            foreach (var templatePhase in phasesToImport)
            {
                var phaseStartDateTime = targetPlan.StartDate.AddDays(templatePhase.StartDayOffset);
                DateTime? phaseEndDateTime = templatePhase.EndDayOffset.HasValue
                    ? targetPlan.StartDate.AddDays(templatePhase.EndDayOffset.Value)
                    : null;

                var existingPhase = (targetCourse.Phases ?? [])
                    .FirstOrDefault(ph =>
                        ph.Type == templatePhase.Type
                        && NormalizeCourseName(ph.Title) == NormalizeCourseName(templatePhase.Title)
                        && NullableDateOnlyEquals(ph.StartDateTime, phaseStartDateTime)
                        && NullableDateOnlyEquals(ph.EndDateTime, phaseEndDateTime));

                var phase = existingPhase ?? new Phase
                {
                    CourseId = targetCourse.Id,
                    Title = templatePhase.Title,
                    Type = templatePhase.Type,
                    Priority = templatePhase.Priority,
                    Notes = templatePhase.Notes,
                    StartDateTime = phaseStartDateTime,
                    EndDateTime = phaseEndDateTime,
                    Status = EventStatus.Pending
                };

                if (existingPhase == null)
                {
                    _context.Phases.Add(phase);
                    await _context.SaveChangesAsync();
                    result.CreatedPhaseIds.Add(phase.Id);

                    targetCourse.Phases ??= new List<Phase>();
                    targetCourse.Phases.Add(phase);
                }

                var routines = templatePhase.Routines
                    .Where(r => !(phase.Routines ?? []).Any(existingRoutine =>
                        existingRoutine.Type == r.Type
                        && NormalizeCourseName(existingRoutine.Name) == NormalizeCourseName(r.Name)
                        && DateOnlyEquals(existingRoutine.StartDate, targetPlan.StartDate.AddDays(r.StartDayOffset))
                        && NullableDateOnlyEquals(existingRoutine.EndDate, r.EndDayOffset.HasValue
                            ? targetPlan.StartDate.AddDays(r.EndDayOffset.Value)
                            : targetPlan.EndDate)))
                    .Select(r => new Routine
                {
                    Name = r.Name,
                    Type = r.Type,
                    UserId = userId,
                    StudyPlanId = targetPlan.Id,
                    PhaseId = phase.Id,
                    StartDate = targetPlan.StartDate.AddDays(r.StartDayOffset),
                    EndDate = r.EndDayOffset.HasValue
                        ? targetPlan.StartDate.AddDays(r.EndDayOffset.Value)
                        : targetPlan.EndDate,
                    Schedules = r.Schedules.Select(s => new Schedule
                    {
                        DayOfWeek = s.DayOfWeek,
                        StartTime = s.StartTime,
                        Duration = s.Duration,
                    }).ToList()
                }).ToList();

                if (routines.Count > 0)
                {
                    _context.Routines.AddRange(routines);
                    await _context.SaveChangesAsync();
                    result.CreatedRoutineIds.AddRange(routines.Select(r => r.Id));

                    phase.Routines ??= new List<Routine>();
                    foreach (var routine in routines)
                    {
                        phase.Routines.Add(routine);
                    }
                }

                var milestoneTasks = templatePhase.Tasks
                    .Where(t => t.Type == TaskType.Milestone)
                    .Where(t => !(phase.Tasks ?? []).Any(existingTask =>
                        existingTask.Type == TaskType.Milestone
                        && NormalizeCourseName(existingTask.Name) == NormalizeCourseName(t.Name)
                        && NullableDateOnlyEquals(existingTask.StartDateTime, targetPlan.StartDate.AddDays(t.StartDayOffset))
                        && NullableDateOnlyEquals(existingTask.EndDateTime, t.EndDayOffset.HasValue
                            ? targetPlan.StartDate.AddDays(t.EndDayOffset.Value)
                            : targetPlan.StartDate.AddDays(t.StartDayOffset))))
                    .Select(t => new TaskItem
                    {
                        Name = t.Name,
                        Description = t.Description,
                        Type = TaskType.Milestone,
                        Status = SmartStudy.Server.Entities.Enums.TaskStatus.Pending,
                        UserId = userId,
                        PhaseId = phase.Id,
                        StartDateTime = targetPlan.StartDate.AddDays(t.StartDayOffset),
                        EndDateTime = t.EndDayOffset.HasValue
                            ? targetPlan.StartDate.AddDays(t.EndDayOffset.Value)
                            : targetPlan.StartDate.AddDays(t.StartDayOffset)
                    }).ToList();

                if (milestoneTasks.Count > 0)
                {
                    _context.Tasks.AddRange(milestoneTasks);
                    await _context.SaveChangesAsync();
                    result.CreatedTaskIds.AddRange(milestoneTasks.Select(t => t.Id));

                    phase.Tasks ??= new List<TaskItem>();
                    foreach (var task in milestoneTasks)
                    {
                        phase.Tasks.Add(task);
                    }
                }
            }
        }

        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }

    foreach (var routineId in result.CreatedRoutineIds)
    {
        BackgroundJob.Enqueue<IRoutineTaskGenerator>(job => job.GenerateForSingleRoutineAsync(routineId));
    }

    return result;
}

private async Task<Subject?> ResolveSubjectForImportAsync(
    TemplateSubject? templateSubject,
    StudyPlanType planType,
    int userId,
    List<Subject> subjectPool)
{
    if (templateSubject == null)
    {
        return null;
    }

    Subject? resolved = null;
    if (!string.IsNullOrWhiteSpace(templateSubject.Code))
    {
        resolved = subjectPool.FirstOrDefault(s =>
            s.Type == planType
            && string.Equals(s.Code, templateSubject.Code, StringComparison.OrdinalIgnoreCase));
    }

    if (resolved == null)
    {
        resolved = subjectPool.FirstOrDefault(s =>
            s.Type == planType
            && string.Equals(s.Name, templateSubject.Name, StringComparison.OrdinalIgnoreCase));
    }

    if (resolved != null)
    {
        return resolved;
    }

    var created = new Subject
    {
        Name = templateSubject.Name,
        Code = templateSubject.Code,
        Credits = templateSubject.Credits,
        Type = planType,
        UserId = userId,
    };
    _context.Subjects.Add(created);
    await _context.SaveChangesAsync();
    subjectPool.Add(created);
    return created;
}

private static List<string> BuildTemplateTags(string? university, string? major, string? cohort)
{
    var tags = new List<string>();
    AppendContextTag(tags, "university", university);
    AppendContextTag(tags, "major", major);
    AppendContextTag(tags, "cohort", cohort);
    return tags;
}

private static TemplatePayload EnsurePayloadCompatibility(TemplatePayload payload)
{
    payload.PayloadVersion = payload.PayloadVersion <= 0 ? 1 : payload.PayloadVersion;
    payload.Tags ??= [];
    payload.Courses ??= [];

    foreach (var course in payload.Courses)
    {
        if (string.IsNullOrWhiteSpace(course.Ref))
        {
            course.Ref = NormalizeTag(course.Name);
        }

        course.Phases ??= [];
        course.Routines ??= [];

        if (course.Phases.Count == 0 && course.Routines.Count > 0)
        {
            course.Phases.Add(new TemplatePhase
            {
                Ref = $"phase-{NormalizeTag(course.Name)}-general",
                Title = "Giai đoạn chung",
                Type = PhaseType.General,
                Priority = PriorityLevel.Low,
                StartDayOffset = 0,
                EndDayOffset = payload.DurationDays,
                Routines = course.Routines,
                Tasks = []
            });
        }

        foreach (var phase in course.Phases)
        {
            if (string.IsNullOrWhiteSpace(phase.Ref))
            {
                phase.Ref = $"phase-{NormalizeTag(course.Name)}-{NormalizeTag(phase.Title)}";
            }

            phase.Routines ??= [];
            phase.Tasks ??= [];
        }
    }

    return payload;
}

private static int ComputeTemplateRank(PlanTemplate template, string? university, string? major, string? cohort)
{
    var tags = template.Payload?.Tags ?? [];
    if (tags.Count == 0)
    {
        return 0;
    }

    var normalizedTags = tags
        .Select(NormalizeTag)
        .Where(v => !string.IsNullOrWhiteSpace(v))
        .ToHashSet(StringComparer.Ordinal);

    var universityTag = NormalizeTag(ExtractTagValue(tags, "university") ?? string.Empty);
    var majorTag = NormalizeTag(ExtractTagValue(tags, "major") ?? string.Empty);
    var cohortTag = NormalizeTag(ExtractTagValue(tags, "cohort") ?? string.Empty);

    var score = 0;
    if (!string.IsNullOrWhiteSpace(major)
        && (majorTag == NormalizeTag(major) || normalizedTags.Contains(NormalizeTag(major))))
    {
        score += 6;
    }
    if (!string.IsNullOrWhiteSpace(university)
        && (universityTag == NormalizeTag(university) || normalizedTags.Contains(NormalizeTag(university))))
    {
        score += 3;
    }
    if (!string.IsNullOrWhiteSpace(cohort)
        && (cohortTag == NormalizeTag(cohort) || normalizedTags.Contains(NormalizeTag(cohort))))
    {
        score += 2;
    }

    return score;
}

private static void AppendContextTag(List<string> tags, string key, string? value)
{
    if (string.IsNullOrWhiteSpace(value))
    {
        return;
    }

    tags.Add($"{key}:{value.Trim()}");
}

private static string? ExtractTagValue(IEnumerable<string> tags, string key)
{
    var prefix = $"{key}:";
    var prefixedValue = tags.FirstOrDefault(t => t.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
    if (!string.IsNullOrWhiteSpace(prefixedValue))
    {
        return prefixedValue[prefix.Length..].Trim();
    }

    return null;
}

private static PlanTemplateDto MapToTemplateDto(PlanTemplate template, int cloneCount = 0)
{
    var payload = EnsurePayloadCompatibility(template.Payload ?? new TemplatePayload());
    var tags = payload.Tags ?? [];

    var phaseCount = payload.Courses
        .Sum(c => c.Phases?.Count ?? 0);
    var milestoneCount = payload.Courses
        .Sum(c => c.Phases?.Sum(ph => ph.Tasks?.Count(t => t.Type == TaskType.Milestone) ?? 0) ?? 0);
    var coursePreviewNames = payload.Courses
        .Select(c => c.Name)
        .Where(v => !string.IsNullOrWhiteSpace(v))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .Take(3)
        .ToList();
    var phasePreviewNames = payload.Courses
        .SelectMany(c => c.Phases ?? [])
        .Select(ph => ph.Title)
        .Where(v => !string.IsNullOrWhiteSpace(v))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .Take(3)
        .ToList();

    return new PlanTemplateDto
    {
        Id = template.Id,
        Name = template.Name,
        Description = template.Description,
        IsPublic = template.IsPublic,
        CreatedAt = template.CreatedAt,
        CreatedByName = template.CreatedBy?.FullName,
        SourcePlanId = template.SourcePlanId,
        CourseCount = payload.Courses.Count,
        RoutineCount = payload.Courses
            .Sum(c => c.Phases.Sum(ph => ph.Routines.Count) + (c.Routines?.Count ?? 0)),
        PhaseCount = phaseCount,
        MilestoneCount = milestoneCount,
        CloneCount = cloneCount,
        DurationDays = payload.DurationDays,
        Type = template.Type,
        Tags = tags,
        CoursePreviewNames = coursePreviewNames,
        PhasePreviewNames = phasePreviewNames,
        UniversityTag = ExtractTagValue(tags, "university"),
        MajorTag = ExtractTagValue(tags, "major"),
        ContextTag = ExtractTagValue(tags, "major")
    };
}

private static List<PlanTemplateDetailCourseDto> BuildDetailCourses(TemplatePayload payload)
{
    var courses = payload.Courses ?? [];
    return courses.Select(course =>
    {
        var phases = course.Phases ?? [];
        var mappedPhases = phases.Select(phase =>
        {
            var phaseStart = phase.StartDayOffset;
            var phaseEnd = phase.EndDayOffset ?? payload.DurationDays;
            var phaseDuration = Math.Max(1, phaseEnd - phaseStart + 1);

            var routineItems = (phase.Routines ?? []).Select(routine =>
            {
                var routineStart = routine.StartDayOffset;
                var routineEnd = routine.EndDayOffset ?? phaseEnd;
                var routineDuration = Math.Max(1, routineEnd - routineStart + 1);
                var scheduleCount = routine.Schedules?.Count ?? 0;
                var totalSessions = scheduleCount == 0
                    ? 0
                    : scheduleCount * Math.Max(1, (int)Math.Ceiling(routineDuration / 7d));

                return new PlanTemplateDetailItemDto
                {
                    ItemType = TemplateDetailItemType.Routine,
                    Name = routine.Name,
                    StartDayOffset = routineStart,
                    DurationDays = routineDuration,
                    TotalSessions = totalSessions,
                    Description = null,
                };
            });

            var milestoneItems = (phase.Tasks ?? [])
                .Where(task => task.Type == TaskType.Milestone)
                .Select(task =>
                {
                    var taskStart = task.StartDayOffset;
                    var taskEnd = task.EndDayOffset ?? task.StartDayOffset;
                    var taskDuration = Math.Max(1, taskEnd - taskStart + 1);

                    return new PlanTemplateDetailItemDto
                    {
                        ItemType = TemplateDetailItemType.Milestone,
                        Name = task.Name,
                        Description = task.Description,
                        StartDayOffset = taskStart,
                        DurationDays = taskDuration,
                        TotalSessions = null,
                    };
                });

            return new PlanTemplateDetailPhaseDto
            {
                Ref = phase.Ref,
                Title = phase.Title,
                Type = phase.Type,
                StartDayOffset = phaseStart,
                EndDayOffset = phase.EndDayOffset,
                DurationDays = phaseDuration,
                Items = routineItems
                    .Concat(milestoneItems)
                    .OrderBy(item => item.StartDayOffset)
                    .ThenBy(item => item.ItemType)
                    .ToList(),
            };
        }).ToList();

        return new PlanTemplateDetailCourseDto
        {
            Ref = course.Ref,
            Name = course.Name,
            SubjectCode = course.Subject?.Code,
            Description = string.IsNullOrWhiteSpace(course.Goal)
                ? $"Lộ trình học tập môn {course.Name} được tối ưu hóa theo giai đoạn."
                : course.Goal,
            Phases = mappedPhases,
        };
    }).ToList();
}

private static string NormalizeTag(string value)
{
    var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
    var builder = new StringBuilder();
    foreach (var c in normalized)
    {
        var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
        if (unicodeCategory != UnicodeCategory.NonSpacingMark)
        {
            builder.Append(c);
        }
    }

    return builder.ToString().Normalize(NormalizationForm.FormC);
}

private static string NormalizeCourseName(string value)
{
    var normalized = NormalizeTag(value);
    var builder = new StringBuilder(normalized.Length);
    foreach (var c in normalized)
    {
        if (!char.IsWhiteSpace(c))
        {
            builder.Append(c);
        }
    }

    return builder.ToString();
}

private static bool DateOnlyEquals(DateTime left, DateTime right)
{
    return left.Date == right.Date;
}

private static bool NullableDateOnlyEquals(DateTime? left, DateTime? right)
{
    if (!left.HasValue && !right.HasValue)
    {
        return true;
    }

    if (!left.HasValue || !right.HasValue)
    {
        return false;
    }

    return left.Value.Date == right.Value.Date;
}
}