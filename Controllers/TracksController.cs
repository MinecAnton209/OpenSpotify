using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenSpotify.API.Data;
using OpenSpotify.API.DTOs;
using OpenSpotify.API.Services;

namespace OpenSpotify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TracksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileStorageService _fileStorage;

        public TracksController(ApplicationDbContext context, IFileStorageService fileStorage)
        {
            _context = context;
            _fileStorage = fileStorage;
        }

        [HttpGet("{id}/stream")]
        public async Task<IActionResult> StreamTrackAudio(Guid id)
        {
            var track = await _context.Tracks.FindAsync(id);

            if (track == null || string.IsNullOrEmpty(track.AudioUrl))
            {
                return NotFound("Track or audio file not found.");
            }
            
            try
            {
                var (fileStream, contentType) = await _fileStorage.GetFileStreamAsync(track.AudioUrl);
                
                return File(fileStream, contentType, enableRangeProcessing: true);
            }
            catch (FileNotFoundException)
            {
                return NotFound("Audio file not found in storage.");
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<TrackDto>> GetTrack(Guid id)
        {
            var track = await _context.Tracks
                .Where(t => t.Id == id)
                .Include(t => t.Album).ThenInclude(a => a.Artist)
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DurationInSeconds = t.DurationInSeconds,
                    AudioUrl = t.AudioUrl,
                    CanvasVideoUrl = t.CanvasVideoUrl,
                    ArtistName = t.Album.Artist.Name,
                    AlbumCoverImageUrl = t.Album.CoverImageUrl,
                    AlbumName = t.Album.Title,
                    AlbumId = t.Album.Id
                })
                .FirstOrDefaultAsync();

            if (track == null)
            {
                return NotFound();
            }
    
            return Ok(track);
        }
    }
}