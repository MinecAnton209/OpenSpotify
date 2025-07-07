using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenSpotify.API.Data;
using OpenSpotify.API.DTOs;
using OpenSpotify.API.Entities;

namespace OpenSpotify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public AdminController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    Roles = await _userManager.GetRolesAsync(user)
                });
            }

            return Ok(userDtos);
        }

        [HttpPost("users/{userId}/assign-artist-role")]
        public async Task<IActionResult> AssignArtistRole(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("User not found.");
            if (await _userManager.IsInRoleAsync(user, "Artist")) return BadRequest("User is already an artist.");

            var artistProfileExists = await _context.Artists.AnyAsync(a => a.UserId == user.Id);
            if (!artistProfileExists)
            {
                var newArtist = new Artist
                {
                    Id = Guid.NewGuid(),
                    Name = user.UserName,
                    UserId = user.Id
                };
                await _context.Artists.AddAsync(newArtist);
            }

            var result = await _userManager.AddToRoleAsync(user, "Artist");

            if (result.Succeeded)
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Artist role assigned and profile created." });
            }

            return BadRequest(result.Errors);
        }

        [HttpDelete("users/{userId}/remove-artist-role")]
        public async Task<IActionResult> RemoveArtistRole(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("User not found.");

            var artistProfile = await _context.Artists.FirstOrDefaultAsync(a => a.UserId == userId);
            if (artistProfile != null)
            {
                _context.Artists.Remove(artistProfile);
            }

            var result = await _userManager.RemoveFromRoleAsync(user, "Artist");

            if (result.Succeeded)
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Artist role and profile removed." });
            }

            return BadRequest(result.Errors);
        }
    }
}