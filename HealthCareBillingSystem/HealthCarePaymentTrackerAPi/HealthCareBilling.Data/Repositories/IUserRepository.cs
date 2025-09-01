using HealthCareBilling.Model;

namespace HealthCareBilling.Data.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByIdAsync(int id);
        Task<int> CreateAsync(User user);
        Task<bool> UpdateRefreshTokenAsync(int userId, string refreshToken, DateTime expires);
        Task<User?> GetUserByRefreshTokenAsync(string refreshToken);
    }
}