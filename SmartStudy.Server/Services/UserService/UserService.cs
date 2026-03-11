using MapsterMapper;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;

namespace SmartStudy.Server.Services
{
    public interface IUserService
    {
        public Task SettingStudentInfo(StudentInfoDto settingDto);
    }
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IMapper _mapster;
        private readonly ICurrentUserService _currentUserService;

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
        }

        public async Task SettingStudentInfo(StudentInfoDto settingDto)
        {
            var userId = _currentUserService.UserId;
            var user = await _dbContext.StudentInfos.FindAsync(userId);

            if (user == null)
            {
                throw new KeyNotFoundException("Không tìm thấy sinh viên");
            }
            _mapster.Map(settingDto, user);

            await _dbContext.SaveChangesAsync();
        }
    }
}
