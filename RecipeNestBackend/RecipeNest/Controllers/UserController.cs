using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeNest.Models;
using Microsoft.AspNetCore.Authorization;
using RecipeNest.Data;
using System.Security.Claims;
using RecipeNest.Models.DTOs;
using Microsoft.AspNetCore.Identity;


// This controller manages user-related operations, allowing authenticated users to view and update their profile information, as well as delete their account.
namespace RecipeNest.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly RecipeNestDbContext _context;
        private readonly UserManager<User> _userManager;

        public UserController(RecipeNestDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }



        // GET: api/User/me - Get current authenticated user's profile
        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    PhoneNumber = u.PhoneNumber,
                    UserName = u.UserName,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound();

            return user;
        }


        // GET: api/User/{id} - Only allow users to get their own profile
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(string id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Users can only access their own profile
            if (currentUserId != id)
                return Forbid();

            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    PhoneNumber = u.PhoneNumber,
                    UserName = u.UserName,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // PUT: api/User - Update current user's profile
        [HttpPut]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound();

            // Update only allowed fields
            if (!string.IsNullOrEmpty(dto.FirstName))
                user.FirstName = dto.FirstName;

            if (!string.IsNullOrEmpty(dto.LastName))
                user.LastName = dto.LastName;
            
            user.PhoneNumber = dto.PhoneNumber;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new
            {
                message = "User updated successfully",
                user = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    UserName = user.UserName,
                    CreatedAt = user.CreatedAt
                }
            });
        }

        // DELETE: api/User - Delete current user's account
        [HttpDelete]
        public async Task<IActionResult> DeleteUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            // Delete user's chef profile (cascade will handle recipes, certifications, specializations)
            var chefProfile = await _context.ChefProfiles
                .FirstOrDefaultAsync(cp => cp.UserId == userId);

            if (chefProfile != null)
            {
                // Delete profile image if exists
                if (!string.IsNullOrEmpty(chefProfile.ProfileImageURL))
                {
                    var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", chefProfile.ProfileImageURL.TrimStart('/'));
                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                    }
                }
            }

            // UserManager will handle cascade deletion through Identity
            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "User account deleted successfully" });
        }

        private bool UserExists(string id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
}