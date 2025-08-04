using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenSpotify.API.Data;
using OpenSpotify.API.DTOs;
using OpenSpotify.API.Entities;
using OpenSpotify.API.Services;

namespace OpenSpotify.API.Controllers
{
    [ApiController]
    [Route("api/artist-panel")]
    [Authorize(Roles = "Artist")]
    public class ArtistPanelController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileStorageService _fileStorage;

        public ArtistPanelController(ApplicationDbContext context, IFileStorageService fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
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

            var album =
                await _context.Albums.FirstOrDefaultAsync(a => a.Id == albumId && a.ArtistId == artistProfile.Id);
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

        [HttpPut("albums/{albumId}")]
        public async Task<IActionResult> UpdateAlbum(Guid albumId, CreateAlbumDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var artistProfile = await _context.Artists.AsNoTracking().FirstOrDefaultAsync(a => a.UserId == userId);
            if (artistProfile == null) return Forbid();

            var album =
                await _context.Albums.FirstOrDefaultAsync(a => a.Id == albumId && a.ArtistId == artistProfile.Id);
            if (album == null)
            {
                return NotFound(new { message = "Album not found or you don't have access to it." });
            }

            album.Title = dto.Title;
            album.CoverImageUrl = dto.CoverImageUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("albums/{albumId}")]
        public async Task<IActionResult> DeleteAlbum(Guid albumId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var artistProfile = await _context.Artists.AsNoTracking().FirstOrDefaultAsync(a => a.UserId == userId);
            if (artistProfile == null) return Forbid();

            var album =
                await _context.Albums.FirstOrDefaultAsync(a => a.Id == albumId && a.ArtistId == artistProfile.Id);
            if (album == null)
            {
                return NotFound(new { message = "Album not found or you don't have access to it." });
            }

            _context.Albums.Remove(album);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("albums/{albumId}/cover")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        public async Task<IActionResult> UploadAlbumCover(Guid albumId, IFormFile file)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var artistProfile = await _context.Artists.AsNoTracking().FirstOrDefaultAsync(a => a.UserId == userId);
            if (artistProfile == null) return Forbid();

            var album =
                await _context.Albums.FirstOrDefaultAsync(a => a.Id == albumId && a.ArtistId == artistProfile.Id);
            if (album == null) return NotFound("Album not found.");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (!string.IsNullOrEmpty(album.CoverImageUrl))
            {
                await _fileStorage.DeleteFileAsync(album.CoverImageUrl);
            }

            var fileUrl = await _fileStorage.SaveFileAsync(file.OpenReadStream(), file.FileName, file.ContentType);

            album.CoverImageUrl = fileUrl;
            await _context.SaveChangesAsync();

            return Ok(new { url = fileUrl });
        }

        [HttpPost("tracks/{trackId}/audio")]
        public async Task<IActionResult> UploadTrackAudio(Guid trackId, IFormFile file)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var track = await _context.Tracks
                .Include(t => t.Album.Artist)
                .FirstOrDefaultAsync(t => t.Id == trackId && t.Album.Artist.UserId == userId);

            if (track == null) return NotFound("Track not found.");

            if (!string.IsNullOrEmpty(track.AudioUrl) || !string.IsNullOrEmpty(track.CanvasVideoUrl))
            {
                return Conflict(new { message = "A media file (audio or video) has already been uploaded for this track and cannot be changed." });
            }

            if (file == null || file.Length == 0) return BadRequest("No audio file uploaded.");

            var fileUrl = await _fileStorage.SaveFileAsync(file.OpenReadStream(), file.FileName, file.ContentType);

            track.AudioUrl = fileUrl;
            await _context.SaveChangesAsync();

            return Ok(new { url = fileUrl });
        }

        [HttpPost("tracks/{trackId}/canvas")]
        public async Task<IActionResult> UploadTrackCanvas(Guid trackId, IFormFile file)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var track = await _context.Tracks
                .Include(t => t.Album.Artist)
                .FirstOrDefaultAsync(t => t.Id == trackId && t.Album.Artist.UserId == userId);

            if (track == null) return NotFound("Track not found.");

            if (!string.IsNullOrEmpty(track.AudioUrl) || !string.IsNullOrEmpty(track.CanvasVideoUrl))
            {
                return Conflict(new { message = "A media file (audio or video) has already been uploaded for this track and cannot be changed." });
            }

            if (file == null || file.Length == 0) return BadRequest("No video file uploaded.");

            var fileUrl = await _fileStorage.SaveFileAsync(file.OpenReadStream(), file.FileName, file.ContentType);

            track.CanvasVideoUrl = fileUrl;
            await _context.SaveChangesAsync();

            return Ok(new { url = fileUrl });
        }
    }
}