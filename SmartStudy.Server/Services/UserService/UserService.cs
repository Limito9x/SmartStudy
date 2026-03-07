using MapsterMapper;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;

namespace SmartStudy.Server.Services
{
    public interface IUserService
    {
        public Task SettingUserContext(UserSettingDto settingDto);
    }
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IMapper _mapster;
        private readonly ICurrentUserService _currentUserService;
        private readonly IStudyPlanService _studyPlanService;

        public UserService(
            ApplicationDbContext dbContext,
            IMapper mapster,
            ICurrentUserService currentUserService,
            IStudyPlanService studyPlanService
            )
        {
            _dbContext = dbContext;
            _mapster = mapster;
            _currentUserService = currentUserService;
            _studyPlanService = studyPlanService;
        }

        public async Task SettingUserContext(UserSettingDto settingDto)
        {
            var userId = _currentUserService.UserId;
            var user = await _dbContext.Users.FindAsync(userId);

            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }
            _mapster.Map(settingDto, user);

            if (settingDto.StudyPlans != null && settingDto.StudyPlans.Count > 0)
            {
                await _studyPlanService.BulkSetupStudyPlansAsync(userId, settingDto.StudyPlans);
            }

            await _dbContext.SaveChangesAsync();
        }
    }
}
