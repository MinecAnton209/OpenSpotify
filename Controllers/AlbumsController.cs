using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenSpotify.API.Data;
using OpenSpotify.API.DTOs;

namespace OpenSpotify.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlbumsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AlbumsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AlbumDetailDto>> GetAlbum(int id)
        {
            var album = await _context.Albums
                .Include(a => a.Tracks)
                .Include(a => a.Artist)
                .Where(a => a.Id == id)
                .Select(a => new AlbumDetailDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    CoverImageUrl = a.CoverImageUrl,
                    ArtistId = a.Artist.Id,
                    ArtistName = a.Artist.Name,
                    Tracks = a.Tracks.Select(t => new TrackDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        DurationInSeconds = t.DurationInSeconds
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (album == null)
            {
                return NotFound();
            }

            return Ok(album);
        }
    }
}