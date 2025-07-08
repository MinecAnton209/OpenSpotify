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
    [Route("api/artist-panel")]
    [Authorize(Roles = "Artist")]
    public class ArtistPanelController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ArtistPanelController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<ActionResult<ArtistDetailDto>> GetMyArtistProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var artistProfile = await _context.Artists
                .Where(a => a.UserId == userId)
                .Select(a => new ArtistDetailDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Bio = a.Bio,
                    ProfileImageUrl = a.ProfileImageUrl,
                    IsVerified = a.IsVerified
                })
                .FirstOrDefaultAsync();

            if (artistProfile == null)
            {
                return NotFound("Artist profile not found for this user.");
            }

            return Ok(artistProfile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateMyArtistProfile(UpdateArtistProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var artistProfile = await _context.Artists.FirstOrDefaultAsync(a => a.UserId == userId);

            if (artistProfile == null)
            {
                return NotFound("Artist profile not found for this user.");
            }

            artistProfile.Bio = dto.Bio;
            artistProfile.ProfileImageUrl = dto.ProfileImageUrl;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        [HttpPost("albums")]
        public async Task<IActionResult> CreateAlbum(CreateAlbumDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    
            var artistProfile = await _context.Artists.FirstOrDefaultAsync(a => a.UserId == userId);

            if (artistProfile == null)
            {
                return Forbid("Could not find an artist profile associated with this user.");
            }

            var newAlbum = new Album
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                CoverImageUrl = dto.CoverImageUrl,
                ArtistId = artistProfile.Id
            };

            await _context.Albums.AddAsync(newAlbum);
            await _context.SaveChangesAsync();

            var albumDto = new AlbumDto
            {
                Id = newAlbum.Id,
                Title = newAlbum.Title,
                CoverImageUrl = newAlbum.CoverImageUrl
            };
    
            return CreatedAtAction(nameof(AlbumsController.GetAlbum), "Albums", new { id = newAlbum.Id }, albumDto);
        }
        [HttpGet("albums")]
        public async Task<ActionResult<IEnumerable<AlbumDto>>> GetMyAlbums()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var artistProfile = await _context.Artists.AsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == userId);
    
            if (artistProfile == null)
            {
                return Forbid("Artist profile not found.");
            }

            var albums = await _context.Albums
                .Where(a => a.ArtistId == artistProfile.Id)
                .Select(a => new AlbumDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    CoverImageUrl = a.CoverImageUrl
                })
                .ToListAsync();
        
            return Ok(albums);
        }
        [HttpPost("albums/{albumId}/tracks")]
        public async Task<IActionResult> AddTrackToAlbum(Guid albumId, CreateTrackDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    
            var artistProfile = await _context.Artists.AsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == userId);
            if (artistProfile == null) return Forbid();

            var album = await _context.Albums.FirstOrDefaultAsync(a => a.Id == albumId && a.ArtistId == artistProfile.Id);
            if (album == null)
            {
                return NotFound(new { message = "Album not found or you don't have access to it." });
            }

            var newTrack = new Track
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                DurationInSeconds = dto.DurationInSeconds,
                AlbumId = albumId
            };

            await _context.Tracks.AddAsync(newTrack);
            await _context.SaveChangesAsync();
    
            var trackDto = new TrackDto
            {
                Id = newTrack.Id,
                Title = newTrack.Title,
                DurationInSeconds = newTrack.DurationInSeconds,
                ArtistName = artistProfile.Name, 
                AlbumCoverImageUrl = album.CoverImageUrl
            };
    
            return StatusCode(201, trackDto);
        }
        [HttpPut("tracks/{trackId}")]
        public async Task<IActionResult> UpdateTrack(Guid trackId, CreateTrackDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    
            var track = await _context.Tracks
                .Include(t => t.Album)
                .ThenInclude(a => a.Artist)
                .FirstOrDefaultAsync(t => t.Id == trackId && t.Album.Artist.UserId == userId);

            if (track == null)
            {
                return NotFound(new { message = "Track not found or you don't have access to it." });
            }
    
            track.Title = dto.Title;
            track.DurationInSeconds = dto.DurationInSeconds;
    
            await _context.SaveChangesAsync();
    
            return NoContent();
        }
        [HttpDelete("tracks/{trackId}")]
        public async Task<IActionResult> DeleteTrack(Guid trackId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var track = await _context.Tracks
                .Include(t => t.Album)
                .ThenInclude(a => a.Artist)
                .FirstOrDefaultAsync(t => t.Id == trackId && t.Album.Artist.UserId == userId);

            if (track == null)
            {
                return NotFound(new { message = "Track not found or you don't have access to it." });
            }

            _context.Tracks.Remove(track);
            await _context.SaveChangesAsync();
    
            return NoContent();
        }
    }
}