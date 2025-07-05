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

        [HttpGet("{id}")]
        public async Task<ActionResult<PlaylistDetailDto>> GetPlaylist(Guid id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var playlist = await _context.Playlists
                .Where(p => p.Id == id)
                .Include(p => p.User)
                .Include(p => p.PlaylistTracks)
                    .ThenInclude(pt => pt.Track)
                        .ThenInclude(t => t.Album)
                            .ThenInclude(al => al.Artist)
                .Select(p => new PlaylistDetailDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    OwnerName = p.User.UserName,
                    Tracks = p.PlaylistTracks.Select(pt => new TrackDto 
                    {
                        Id = pt.Track.Id,
                        Title = pt.Track.Title,
                        DurationInSeconds = pt.Track.DurationInSeconds
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (playlist == null)
            {
                return NotFound();
            }

            return Ok(playlist);
        }

        [HttpPost]
        public async Task<ActionResult<PlaylistDto>> CreatePlaylist(CreatePlaylistDto createPlaylistDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var playlist = new Playlist
            {
                Id = Guid.NewGuid(),
                Name = createPlaylistDto.Name,
                UserId = userId
            };

            await _context.Playlists.AddAsync(playlist);
            await _context.SaveChangesAsync();

            var playlistDto = new PlaylistDto
            {
                Id = playlist.Id,
                Name = playlist.Name
            };

            return CreatedAtAction(nameof(GetPlaylist), new { id = playlist.Id }, playlistDto);
        }
    }
}