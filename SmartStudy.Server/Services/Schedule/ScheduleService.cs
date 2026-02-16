using MapsterMapper;
using SmartStudy.Server.Data;
using SmartStudy.Server.Services.UserService;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace SmartStudy.Server.Services.Schedule
{
    public interface IScheduleService
    {
    }
    public class ScheduleService : IScheduleService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        public ScheduleService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IMapper mapper
            )
        {
            _context = context;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        
    }
}
