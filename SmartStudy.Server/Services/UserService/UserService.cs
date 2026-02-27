using MapsterMapper;
using SmartStudy.Server.Data;
using SmartStudy.Server.Dtos;
using SmartStudy.Server.Services.Semester;
using SmartStudy.Server.Services.UserService;

namespace SmartStudy.Server.Services.UserSerivice
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
        private readonly ISemesterService _semesterService;

        public UserService(
            ApplicationDbContext dbContext,
            IMapper mapster,
            ICurrentUserService currentUserService,
            ISemesterService semesterService
            )
        {
            _dbContext = dbContext;
            _mapster = mapster;
            _currentUserService = currentUserService;
            _semesterService = semesterService;
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

            if(settingDto.Semesters != null && settingDto.Semesters.Count > 0)
            {
                await _semesterService.BulkSetupSemestersAsync(userId, settingDto.Semesters);
            }

            await _dbContext.SaveChangesAsync();
        }
    }
}
