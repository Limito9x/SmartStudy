using MapsterMapper;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;

namespace SmartStudy.Server.Services.Goal
{
    public interface IGoalService
    {
        Task<ResponseGoalDto> CreateGoalAsync(RequestGoalDto requestGoalDto);
        Task<ResponseGoalDto> UpdateGoalAsync(int GoalId, RequestGoalDto requestGoalDto);
        Task<ResponseGoalDto?> DeleteGoalAsync(int goalId);
    }
    public class GoalService: IGoalService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public GoalService(
            ApplicationDbContext context,
            IMapper mapper
            )
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ResponseGoalDto?> CreateGoalAsync(RequestGoalDto requestGoalDto)
        {
            var goal = _mapper.Map<Entities.Goal>(requestGoalDto);
            _context.Goals.Add(goal);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseGoalDto>(goal);
        }

        public async Task<ResponseGoalDto> UpdateGoalAsync(int GoalId, RequestGoalDto requestGoalDto)
        {
            var goal = await _context.Goals.FindAsync(GoalId);
            if (goal == null)
            {
                throw new Exception("Goal not found");
            }
            _mapper.Map(requestGoalDto, goal);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseGoalDto>(goal);
        }

        public async Task<ResponseGoalDto?> DeleteGoalAsync(int goalId)
        {
            var goal = await _context.Goals.FindAsync(goalId);
            if (goal == null)
            {
                throw new Exception("Goal not found");
            }
            _context.Goals.Remove(goal);
            await _context.SaveChangesAsync();
            return _mapper.Map<ResponseGoalDto>(goal);
        }
    }
}
