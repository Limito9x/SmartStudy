using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Constants;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Entities.Enums;
using SmartStudy.Server.Helpers;

namespace SmartStudy.Server.Services
{
    public interface ISubjectService
    {
        Task<PagedResult<ResponseSubjectDto>> GetAllSubjectsAsync(PaginationParams paginationParams,
            StudyPlanType? type);
        Task<ResponseSubjectDto> GetSubjectByIdAsync(int SubjectId);
        Task<ResponseSubjectDto> CreateSubjectAsync(RequestSubjectDto SubjectDto);
        Task<List<ResponseSubjectDto>> BulkCreateSubjectsAsync(List<RequestSubjectDto> subjectDtos);
        Task<ResponseSubjectDto> UpdateSubjectAsync(int SubjectId,RequestSubjectDto SubjectDto);
        Task<bool> DeleteSubjectAsync(int SubjectId);
    }
    public class SubjectService : ISubjectService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public SubjectService(ApplicationDbContext context, IMapper mapper, ICurrentUserService currentUserService)
        {
            _context = context;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<PagedResult<ResponseSubjectDto>> GetAllSubjectsAsync(PaginationParams paginationParams,
            StudyPlanType? type)
        {
            var userId = _currentUserService.UserId;
            var query = _context.Subjects
                .Where(s => s.UserId == userId)
                .AsQueryable();

            if (type.HasValue)
            {
                query = query.Where(s => s.Type == type.Value);
            }

            if (!string.IsNullOrWhiteSpace(paginationParams.SearchTerm))
            {
                var searchLower = paginationParams.SearchTerm.Trim().ToLower();
                query = query.Where(s=>s.Name.ToLower().Contains(searchLower));
            }

            query = query.OrderBy(s => s.CreatedAt);

            var dtoQuery = query.ProjectToType<ResponseSubjectDto>();

            var pagedSubjects = await dtoQuery.ToPagedResultAsync(paginationParams.PageIndex, paginationParams.PageSize);

            return pagedSubjects;
        }

        public async Task<ResponseSubjectDto> GetSubjectByIdAsync(int SubjectId)
        {
            var subject = await _context.Subjects.FindAsync(SubjectId)
                          ?? throw new KeyNotFoundException("Không tìm thấy môn học");

            return _mapper.Map<ResponseSubjectDto>(subject);
        }

        public async Task<ResponseSubjectDto> CreateSubjectAsync(RequestSubjectDto SubjectDto)
        {
            var userId = _currentUserService.UserId;
            var subject = _mapper.Map<Entities.Subject>(SubjectDto);
            subject.UserId = userId;
            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseSubjectDto>(subject);
        }

        public async Task<List<ResponseSubjectDto>> BulkCreateSubjectsAsync(List<RequestSubjectDto> subjectDtos)
        {
            var userId = _currentUserService.UserId;
            var subjects = _mapper.Map<List<Entities.Subject>>(subjectDtos);
            subjects.ForEach(s => s.UserId = userId);
            _context.Subjects.AddRange(subjects);
            await _context.SaveChangesAsync();
            return _mapper.Map<List<ResponseSubjectDto>>(subjects);
        }

        public async Task<ResponseSubjectDto> UpdateSubjectAsync(int SubjectId, RequestSubjectDto SubjectDto)
        {
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Id == SubjectId);
            if (subject == null) return null;
            _mapper.Map(SubjectDto, subject);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseSubjectDto>(subject);
        }

        public async Task<bool> DeleteSubjectAsync(int SubjectId)
        {
            var userId = _currentUserService.UserId;
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => 
                s.Id == SubjectId &&
                s.UserId == userId);
            if (subject == null) return false;
            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
