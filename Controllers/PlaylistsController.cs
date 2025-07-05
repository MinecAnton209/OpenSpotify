using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenSpotify.API.Data;
using OpenSpotify.API.DTOs;
using OpenSpotify.API.Entities;

namespace OpenSpotify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlaylistsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PlaylistsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlaylistDto>>> GetUserPlaylists()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized();
            }

            var playlists = await _context.Playlists
                .Where(p => p.UserId == userId)
                .Select(p => new PlaylistDto
                {
                    Id = p.Id,
                    Name = p.Name
                })
                .ToListAsync();

            return Ok(playlists);
        }

        [HttpPost]
        public async Task<ActionResult<PlaylistDto>> CreatePlaylist(CreatePlaylistDto createPlaylistDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var playlist = new Playlist
            {
                Name = createPlaylistDto.Name,
                UserId = userId
            };

            _context.Playlists.Add(playlist);
            await _context.SaveChangesAsync();

            var playlistDto = new PlaylistDto
            {
                Id = playlist.Id,
                Name = playlist.Name
            };

            return CreatedAtAction(nameof(GetUserPlaylists), new { id = playlist.Id }, playlistDto);
        }
    }
}