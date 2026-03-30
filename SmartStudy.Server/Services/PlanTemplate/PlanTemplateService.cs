using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Constants;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Exceptions;
using SmartStudy.Server.Helpers;

namespace SmartStudy.Server.Services;

public interface IPlanTemplateService
{
    // CRUD cơ bản — đã có
    Task<PlanTemplateDto> CreateFromPlanAsync(CreatePlanTemplateDto dto);
    Task<PagedResult<PlanTemplateDto>> GetTemplatesAsync(PaginationParams paginationParams);
    Task<PlanTemplateDetailDto> GetByIdAsync(int templateId);
    Task<PlanTemplateDto> UpdateAsync(int templateId, UpdatePlanTemplateDto dto);
    Task<bool> DeleteAsync(int templateId);

    // Còn thiếu — quan trọng
    Task<ResponseStudyPlanDto> CloneToStudyPlanAsync(CloneTemplateDto dto);
    // ↑ Core feature — user clone template thành plan thật

    Task<List<PlanTemplateDto>> GetMyTemplatesAsync();
    // ↑ Phân biệt template của mình vs public templates của người khác
}
public class PlanTemplateService: IPlanTemplateService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    
    public PlanTemplateService(ApplicationDbContext context, ICurrentUserService currentUserService, IMapper mapper)
    {
        _context = context;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }
    
    private async Task<TemplatePayload> BuildPayloadAsync(int sourcePlanId)
    {
        var plan = await _context.StudyPlans
                       .Include(p => p.Courses)
                           .ThenInclude(c => c.Routines)
                           .ThenInclude(r => r.Schedules)
                       .Include(p => p.Courses)
                           .ThenInclude(c => c.Subject)
                       .FirstOrDefaultAsync(p => p.Id == sourcePlanId)
                   ?? throw new KeyNotFoundException("Không tìm thấy kế hoạch học tập");
        
        var planStart = plan.StartDate;
        var planDurationDays = plan.EndDate.HasValue
            ? (int)(plan.EndDate.Value - planStart).TotalDays
            : 112; // default 16 tuần

        return new TemplatePayload
        {
            DurationDays = planDurationDays,
            Courses = plan.Courses?
                .Where(c => !c.IsDeleted)
                .Select(c => new TemplateCourse
                {
                    Name = c.Name,
                    Goal = c.Goal,
                    TargetScore = c.TargetScore,
                    Subject = c.Subject != null ? new TemplateSubject
                    {
                        Name = c.Subject.Name,
                        Code = c.Subject.Code,
                        Credits = c.Subject.Credits,
                    } : null,
                    Routines = c.Routines?
                        .Where(r => !r.IsDeleted)
                        .Select(r => new TemplateRoutine
                        {
                            Name = r.Name,
                            Type = r.Type,
                            Instructor = r.Instructor,
                            // Offset tương đối từ đầu plan
                            StartDayOffset = (int)(r.StartDate - planStart).TotalDays,
                            EndDayOffset = r.EndDate.HasValue
                                ? (int)(r.EndDate.Value - planStart).TotalDays
                                : null, // null = chạy đến hết plan
                            Schedules = r.Schedules
                                .Select(s => new TemplateSchedule
                                {
                                    DayOfWeek = s.DayOfWeek,
                                    StartTime = s.StartTime,
                                    Duration = s.Duration,
                                    Location = s.Location,
                                }).ToList()
                        }).ToList() ?? []
                }).ToList() ?? []
        };
    }

    public async Task<PlanTemplateDto> CreateFromPlanAsync(CreatePlanTemplateDto dto)
    {
        var userId = _currentUserService.UserId;
        var payload = await BuildPayloadAsync(dto.SourcePlanId);
        
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
            // Lấy tên plan gốc nếu không truyền name
            var plan = await _context.StudyPlans
                .Where(p => p.Id == dto.SourcePlanId)
                .Select(p => new
                {
                    Name = p.Name,
                    Type = p.Type
                })
                .FirstOrDefaultAsync();

            var template = new PlanTemplate
            {
                Name = dto.Name ?? plan.Name ?? "Template mới",
                Type = plan.Type,
                Description = dto.Description,
                IsPublic = dto.IsPublic,
                CreatedById = userId,
                SourcePlanId = dto.SourcePlanId,
                Payload = payload,
            };
            _context.PlanTemplates.Add(template);
        }

        await _context.SaveChangesAsync();
        return existing != null
            ? _mapper.Map<PlanTemplateDto>(existing)
            : (await _context.PlanTemplates
                .OrderByDescending(t => t.CreatedAt)
                .FirstAsync(t => t.SourcePlanId == dto.SourcePlanId
                                 && t.CreatedById == userId))
            .Adapt<PlanTemplateDto>();
    }

    public async Task<List<PlanTemplateDto>> GetMyTemplatesAsync()
    {
        var userId = _currentUserService.UserId;
        var templates = await _context.PlanTemplates
            .Where(t => t.CreatedById == userId)
            .Include(t => t.SourcePlan)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
        
        return _mapper.Map<List<PlanTemplateDto>>(templates);
    }

    public async Task<PlanTemplateDetailDto> GetByIdAsync(int templateId)
    {
        var template = _context.PlanTemplates
            .Include(t => t.SourcePlan)
            .FirstOrDefault(t => t.Id == templateId)
            ?? throw new KeyNotFoundException("Không tìm thấy template");
        
        

        var dto = new PlanTemplateDetailDto()
        {
            Id = templateId,
            Name = template.Name,
            Description = template.Description,
            IsPublic = template.IsPublic,
            CreatedAt = template.CreatedAt,
            CreatedByName = (await _context.Users.FindAsync(template.CreatedById))?.FullName,
            SourcePlanId = template.SourcePlanId,
            CourseCount = template.Payload?.Courses?.Count ?? 0,
            RoutineCount = template.Payload?.Courses?
                .Sum(c => c.Routines?.Count ?? 0) ?? 0,
            DurationDays = template.Payload?.DurationDays,
            Payload = template.Payload
        };
        
        if (template.IsPublic) return dto;
        
        return template.CreatedById != _currentUserService.UserId 
            ? throw new UnauthorizedAccessException("Bạn không có quyền xem template này") 
            : dto;
    }

    public async Task<PagedResult<PlanTemplateDto>> GetTemplatesAsync(PaginationParams paginationParams)
    {
        var query = _context.PlanTemplates
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
        
        if(!String.IsNullOrWhiteSpace(paginationParams.SearchTerm))
        {
            var searchLower = paginationParams.SearchTerm.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(searchLower) 
                                     || (t.Description != null && t.Description.ToLower().Contains(searchLower)));
        }
        
        query = query.OrderByDescending(t => t.CreatedAt);
        
        var pagedEntities = await query
            .ToPagedResultAsync(
                paginationParams.PageIndex, 
                paginationParams.PageSize);

        // Map sau — tính computed fields từ Payload
        var dtoItems = pagedEntities.Items.Select(t => new PlanTemplateDto
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            IsPublic = t.IsPublic,
            CreatedAt = t.CreatedAt,
            CreatedByName = t.CreatedBy?.FullName,
            SourcePlanId = t.SourcePlanId,
            CourseCount = t.Payload?.Courses?.Count ?? 0,
            RoutineCount = t.Payload?.Courses?
                .Sum(c => c.Routines?.Count ?? 0) ?? 0,
            DurationDays = t.Payload?.DurationDays,
        }).ToList();

        return new PagedResult<PlanTemplateDto>
        {
            Items = dtoItems,
            TotalCount = pagedEntities.TotalCount,
            PageIndex = pagedEntities.PageIndex,
            PageSize = pagedEntities.PageSize,
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

        _mapper.Map(dto, template);
        await _context.SaveChangesAsync();
        return _mapper.Map<PlanTemplateDto>(template);
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

    var payload = template.Payload
        ?? throw new AppException("Template không có dữ liệu");

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
            UserId = userId
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

    // Bước 2 — Tạo routines sau khi có StudyPlanId và CourseId
    for (int i = 0; i < payload.Courses.Count; i++)
    {
        var templateCourse = payload.Courses[i];
        var course = plan.Courses[i];

        var routines = templateCourse.Routines.Select(r => new Routine
        {
            Name = r.Name,
            Type = r.Type,
            Instructor = r.Instructor,
            UserId = userId,
            StudyPlanId = plan.Id,   // ← có rồi
            CourseId = course.Id,    // ← có rồi
            StartDate = startDate.AddDays(r.StartDayOffset),
            EndDate = r.EndDayOffset.HasValue
                ? startDate.AddDays(r.EndDayOffset.Value)
                : endDate,
            NextOccurrence = startDate.AddDays(r.StartDayOffset),
            Schedules = r.Schedules.Select(s => new Schedule
            {
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                Duration = s.Duration,
                Location = s.Location,
            }).ToList()
        }).ToList();

        _context.Routines.AddRange(routines);
    }

    await _context.SaveChangesAsync();

    // Load lại để map DTO
    await _context.Entry(plan)
        .Collection(p => p.Courses)
        .LoadAsync();

    return plan.Adapt<ResponseStudyPlanDto>();
}
}