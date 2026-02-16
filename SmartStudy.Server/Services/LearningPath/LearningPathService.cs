using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.UserService;

namespace SmartStudy.Server.Services.LearningPath
{
    public interface ILearningPathService
    {
        Task<ResponseLearningPathDto> CreateLearningPathAsync(RequestLearningPathDto learningPathDto);
        Task<List<ResponseLearningPathDto>> GetLearningPathsByUserIdAsync();
        Task<ResponseLearningPathDto?> GetLearningPathByIdAsync(int learningPathId);
        Task<ResponseLearningPathDto?> UpdateLearningPathAsync(int learningPathId, RequestLearningPathDto learningPathDto);
        Task<bool> DeleteLearningPathAsync(int learningPathId);
    }
    public class LearningPathService : ILearningPathService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public LearningPathService(
            ApplicationDbContext context,
            IMapper mapper,
            ICurrentUserService currentUserService
            )
        {
            _context = context;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<ResponseLearningPathDto> CreateLearningPathAsync(RequestLearningPathDto learningPathDto)
        {
            var learningPath = _mapper.Map<Entities.LearningPath>(learningPathDto);
            _context.LearningPaths.Add(learningPath);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseLearningPathDto>(learningPath);
        }

        public async Task<ResponseLearningPathDto?> GetLearningPathByIdAsync(int learningPathId)
        {
            var learningPath = await _context.LearningPaths.FindAsync(learningPathId);
            if (learningPath == null)
            {
                return null;
            }
            return _mapper.Map<ResponseLearningPathDto>(learningPath);
        }

        public async Task<ResponseLearningPathDto?> UpdateLearningPathAsync(int learningPathId, RequestLearningPathDto learningPathDto)
        {
            var existingLearningPath = await _context.LearningPaths.FindAsync(learningPathId);
            if (existingLearningPath == null)
            {
                return null;
            }
            _mapper.Map(learningPathDto, existingLearningPath);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseLearningPathDto>(existingLearningPath);
        }

        public async Task<bool> DeleteLearningPathAsync(int learningPathId)
        {
            var learningPath = await _context.LearningPaths.FindAsync(learningPathId);
            if (learningPath == null)
            {
                return false;
            }
            _context.LearningPaths.Remove(learningPath);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ResponseLearningPathDto>> GetLearningPathsByUserIdAsync()
        {
            var userId = _currentUserService.UserId;
            var learningPaths = await _context.LearningPaths.Where(lp => lp.UserId == userId).ToListAsync();
            return _mapper.Map<List<ResponseLearningPathDto>>(learningPaths);
        }
    }
}
