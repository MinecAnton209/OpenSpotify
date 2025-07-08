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
    [Route("api/me")]
    [Authorize]
    public class LibraryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LibraryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("tracks/{trackId}/like")]
        public async Task<IActionResult> LikeTrack(Guid trackId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!await _context.Tracks.AnyAsync(t => t.Id == trackId))
            {
                return NotFound(new { message = "Track not found." });
            }

            var alreadyLiked = await _context.LikedTracks
                .AnyAsync(lt => lt.UserId == userId && lt.TrackId == trackId);

            if (alreadyLiked)
            {
                return Ok(new { message = "Track is already liked." });
            }

            var likedTrack = new LikedTrack
            {
                UserId = userId,
                TrackId = trackId,
                LikedAt = DateTime.UtcNow
            };

            await _context.LikedTracks.AddAsync(likedTrack);
            await _context.SaveChangesAsync();

            return StatusCode(201, new { message = "Track liked successfully." });
        }

        [HttpDelete("tracks/{trackId}/like")]
        public async Task<IActionResult> UnlikeTrack(Guid trackId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var likedTrack = await _context.LikedTracks
                .FirstOrDefaultAsync(lt => lt.UserId == userId && lt.TrackId == trackId);

            if (likedTrack == null)
            {
                return NotFound(new { message = "You haven't liked this track." });
            }

            _context.LikedTracks.Remove(likedTrack);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("liked-tracks")]
        public async Task<ActionResult<IEnumerable<TrackDto>>> GetLikedTracks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var likedTrackIds = await _context.LikedTracks
                .Where(lt => lt.UserId == userId)
                .OrderByDescending(lt => lt.LikedAt)
                .Select(lt => lt.TrackId)
                .ToListAsync();

            if (!likedTrackIds.Any())
            {
                return Ok(new List<TrackDto>());
            }

            var tracks = await _context.Tracks
                .Where(t => likedTrackIds.Contains(t.Id))
                .Include(t => t.Album)
                .ThenInclude(al => al.Artist)
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DurationInSeconds = t.DurationInSeconds,
                    ArtistName = t.Album.Artist.Name,
                    AlbumCoverImageUrl = t.Album.CoverImageUrl,
                    AudioUrl = t.AudioUrl
                })
                .ToListAsync();

            var sortedTracks = tracks
                .OrderBy(t => likedTrackIds.IndexOf(t.Id))
                .ToList();

            return Ok(sortedTracks);
        }

        [HttpGet("liked-tracks-ids")]
        public async Task<ActionResult<IEnumerable<Guid>>> GetLikedTracksIds()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var likedTrackIds = await _context.LikedTracks
                .Where(lt => lt.UserId == userId)
                .Select(lt => lt.TrackId)
                .ToListAsync();
            return Ok(likedTrackIds);
        }
    }
}