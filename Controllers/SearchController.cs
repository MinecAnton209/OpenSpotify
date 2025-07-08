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
    public class SearchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SearchController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<SearchResultDto>> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Ok(new SearchResultDto());
            }

            var lowerCaseQuery = query.ToLower();

            var artists = await _context.Artists
                .Where(a => a.Name.ToLower().Contains(lowerCaseQuery))
                .Take(5)
                .Select(a => new ArtistDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    ProfileImageUrl = a.ProfileImageUrl,
                    IsVerified = a.IsVerified
                })
                .ToListAsync();

            var albums = await _context.Albums
                .Where(a => a.Title.ToLower().Contains(lowerCaseQuery))
                .Take(5)
                .Select(a => new AlbumDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    CoverImageUrl = a.CoverImageUrl
                })
                .ToListAsync();

            var tracks = await _context.Tracks
                .Include(t => t.Album)
                    .ThenInclude(al => al.Artist)
                .Where(t => t.Title.ToLower().Contains(lowerCaseQuery))
                .Take(10)
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

            var result = new SearchResultDto
            {
                Artists = artists,
                Albums = albums,
                Tracks = tracks
            };

            return Ok(result);
        }
    }
}