using Dapper;
using HealthCareBilling.Model;
using System.Data;
using HealthCareBilling.Data.Data;
using HealthCareBilling.Data.Repositories;

namespace HealthCareBilling.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DapperContext _context;

        public UserRepository(DapperContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            var query = "SELECT * FROM Users WHERE Username = @Username AND IsActive = 1";
            
            using var connection = _context.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<User?>(query, new { Username = username });
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            var query = "SELECT * FROM Users WHERE Id = @Id AND IsActive = 1";
            
            using var connection = _context.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<User?>(query, new { Id = id });
        }

        public async Task<int> CreateAsync(User user)
        {
            var query = @"INSERT INTO Users (Username, Email, PasswordHash, PasswordSalt, CreatedAt, IsActive, Role)
                         OUTPUT INSERTED.Id
                         VALUES (@Username, @Email, @PasswordHash, @PasswordSalt, @CreatedAt, @IsActive, @Role)";
            
            using var connection = _context.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(query, user);
        }

        public async Task<bool> UpdateRefreshTokenAsync(int userId, string refreshToken, DateTime expires)
        {
            var revokeQuery = "UPDATE RefreshTokens SET Revoked = GETDATE() WHERE UserId = @UserId AND Revoked IS NULL";
            
            var insertQuery = @"INSERT INTO RefreshTokens (UserId, Token, Expires, Created)
                               VALUES (@UserId, @Token, @Expires, GETDATE())";
            
            using var connection = _context.CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();
            
            try
            {
                await connection.ExecuteAsync(revokeQuery, new { UserId = userId }, transaction);
                await connection.ExecuteAsync(insertQuery, new 
                { 
                    UserId = userId, 
                    Token = refreshToken, 
                    Expires = expires 
                }, transaction);
                
                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                return false;
            }
        }

        public async Task<User?> GetUserByRefreshTokenAsync(string refreshToken)
        {
            var query = @"SELECT u.* FROM Users u
                         INNER JOIN RefreshTokens rt ON u.Id = rt.UserId
                         WHERE rt.Token = @RefreshToken 
                         AND rt.Expires > GETDATE() 
                         AND rt.Revoked IS NULL
                         AND u.IsActive = 1";
            
            using var connection = _context.CreateConnection();
            return await connection.QueryFirstOrDefaultAsync<User?>(query, new { RefreshToken = refreshToken });
        }
    }
}