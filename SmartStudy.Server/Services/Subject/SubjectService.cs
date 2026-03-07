using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Exceptions;

namespace SmartStudy.Server.Services
{
    public interface ISubjectService
    {
        Task<List<ResponseSubjectDto>> GetAllSubjectsAsync();
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

        public async Task<List<ResponseSubjectDto>> GetAllSubjectsAsync()
        {
            var userId = _currentUserService.UserId;
            var subjects = await _context.Subjects.Where(s => s.UserId == userId).ToListAsync();
            return _mapper.Map<List<ResponseSubjectDto>>(subjects);
        }

        public async Task<ResponseSubjectDto> GetSubjectByIdAsync(int SubjectId)
        {
            var userId = _currentUserService.UserId;
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Id == SubjectId && s.UserId == userId) ?? throw new AppException("Không tìm thấy môn học");
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
            var userId = _currentUserService.UserId;
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Id == SubjectId && s.UserId == userId);
            if (subject == null) return null;
            _mapper.Map(SubjectDto, subject);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseSubjectDto>(subject);
        }

        public async Task<bool> DeleteSubjectAsync(int SubjectId)
        {
            var userId = _currentUserService.UserId;
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Id == SubjectId && s.UserId == userId);
            if (subject == null) return false;
            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
