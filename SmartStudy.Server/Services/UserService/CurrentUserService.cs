using System.Security.Claims;

namespace SmartStudy.Server.Services.UserService
{
    public interface ICurrentUserService
    {
        int UserId { get; }
        void CheckAuthorized(int resourceOwnerId, string? resourceName);
    }

    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public int UserId
        {
            get
            {
                var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return userIdString == null
                    ? throw new UnauthorizedAccessException("User is not authenticated.")
                    : int.Parse(userIdString);
            }
        }

        public void CheckAuthorized(int resourceOwnerId, string? resourceName)
        {
            if (UserId != resourceOwnerId)
            {
                throw new UnauthorizedAccessException($"You do not have access to this {resourceName??new string("resource")}");
            }
        }
    }
}
