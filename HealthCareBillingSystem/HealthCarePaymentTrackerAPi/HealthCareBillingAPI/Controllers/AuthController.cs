using Microsoft.AspNetCore.Mvc;
using HealthCareBilling.Model;
using HealthCareBillingAPI.Services;
using HealthCareBilling.Data.Repositories;
using HealthCareBilling.Data.Helpers;

namespace HealthCareBillingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;

        public AuthController(IUserRepository userRepository, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegister model)
        {
            if (await _userRepository.GetByUsernameAsync(model.Username) != null)
                return BadRequest("Username already exists");

            PasswordHasher.CreatePasswordHash(model.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Username = model.Username,
                Email = model.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                Role = model.Role
            };

            var userId = await _userRepository.CreateAsync(user);
            
            var refreshToken = _jwtService.GenerateRefreshToken();
            var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            
            await _userRepository.UpdateRefreshTokenAsync(userId, refreshToken, refreshTokenExpiry);

            var jwtToken = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Id = userId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = jwtToken,
                RefreshToken = refreshToken
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLogin model)
        {
            var user = await _userRepository.GetByUsernameAsync(model.Username);
            if (user == null)
                return Unauthorized("Invalid credentials");

            if (!PasswordHasher.VerifyPasswordHash(model.Password, user.PasswordHash, user.PasswordSalt))
                return Unauthorized("Invalid credentials");

            var refreshToken = _jwtService.GenerateRefreshToken();
            var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            
            await _userRepository.UpdateRefreshTokenAsync(user.Id, refreshToken, refreshTokenExpiry);

            var jwtToken = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = jwtToken,
                RefreshToken = refreshToken
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            var principal = _jwtService.GetPrincipalFromExpiredToken(request.Token);
            var username = principal.Identity?.Name;
            
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Invalid token");

            var user = await _userRepository.GetUserByRefreshTokenAsync(request.RefreshToken);
            if (user == null || user.Username != username)
                return Unauthorized("Invalid refresh token");

            var newRefreshToken = _jwtService.GenerateRefreshToken();
            var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            
            await _userRepository.UpdateRefreshTokenAsync(user.Id, newRefreshToken, refreshTokenExpiry);

            var newJwtToken = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = newJwtToken,
                RefreshToken = newRefreshToken
            });
        }
    }

    public class RefreshTokenRequest
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}