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
                        DurationInSeconds = pt.Track.DurationInSeconds,
                        ArtistName = pt.Track.Album.Artist.Name,
                        AlbumCoverImageUrl = pt.Track.Album.CoverImageUrl
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
        [HttpPost("{playlistId}/tracks")]
        public async Task<IActionResult> AddTrackToPlaylist(Guid playlistId, AddTrackToPlaylistDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var playlist = await _context.Playlists
                .FirstOrDefaultAsync(p => p.Id == playlistId && p.UserId == userId);

            if (playlist == null)
            {
                return NotFound(new { message = "Playlist not found or you don't have access." });
            }

            var trackExists = await _context.Tracks.AnyAsync(t => t.Id == dto.TrackId);
            if (!trackExists)
            {
                return NotFound(new { message = "Track not found." });
            }

            var trackAlreadyInPlaylist = await _context.PlaylistTracks
                .AnyAsync(pt => pt.PlaylistId == playlistId && pt.TrackId == dto.TrackId);

            if (trackAlreadyInPlaylist)
            {
                return Conflict(new { message = "Track is already in this playlist." });
            }

            var playlistTrack = new PlaylistTrack
            {
                PlaylistId = playlistId,
                TrackId = dto.TrackId,
                AddedAt = DateTime.UtcNow
            };

            await _context.PlaylistTracks.AddAsync(playlistTrack);
            await _context.SaveChangesAsync();
    
            return StatusCode(201, new { message = "Track added successfully."});
        }
        [HttpDelete("{playlistId}/tracks/{trackId}")]
        public async Task<IActionResult> RemoveTrackFromPlaylist(Guid playlistId, Guid trackId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var playlistBelongsToUser = await _context.Playlists
                .AnyAsync(p => p.Id == playlistId && p.UserId == userId);
    
            if (!playlistBelongsToUser)
            {
                return NotFound(new { message = "Playlist not found or you don't have access." });
            }

            var playlistTrack = await _context.PlaylistTracks
                .FirstOrDefaultAsync(pt => pt.PlaylistId == playlistId && pt.TrackId == trackId);

            if (playlistTrack == null)
            {
                return NotFound(new { message = "Track not found in this playlist." });
            }

            _context.PlaylistTracks.Remove(playlistTrack);
            await _context.SaveChangesAsync();
    
            return NoContent();
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlaylist(Guid id, UpdatePlaylistDto updateDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var playlist = await _context.Playlists
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (playlist == null)
            {
                return NotFound(new { message = "Playlist not found or you don't have access." });
            }

            playlist.Name = updateDto.Name;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlaylist(Guid id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var playlist = await _context.Playlists
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (playlist == null)
            {
                return NotFound(new { message = "Playlist not found or you don't have access." });
            }

            _context.Playlists.Remove(playlist);
            await _context.SaveChangesAsync();
    
            return NoContent();
        }
    }
}