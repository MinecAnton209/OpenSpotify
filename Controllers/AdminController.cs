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

        public AdminController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
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
            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (await _userManager.IsInRoleAsync(user, "Artist"))
            {
                return BadRequest("User is already an artist.");
            }

            var result = await _userManager.AddToRoleAsync(user, "Artist");

            if (result.Succeeded)
            {
                return Ok(new { message = "Artist role assigned successfully." });
            }

            return BadRequest(result.Errors);
        }
        
        [HttpDelete("users/{userId}/remove-artist-role")]
        public async Task<IActionResult> RemoveArtistRole(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }
    
            var result = await _userManager.RemoveFromRoleAsync(user, "Artist");

            if (result.Succeeded)
            {
                return Ok(new { message = "Artist role removed successfully." });
            }

            return BadRequest(result.Errors);
        }
    }
}