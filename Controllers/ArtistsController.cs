// Controllers/ArtistsController.cs
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
    public class ArtistsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ArtistsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResultDto<ArtistDto>>> GetArtists(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10)
        {
            var totalCount = await _context.Artists.CountAsync();
    
            var artists = await _context.Artists
                .OrderBy(a => a.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize) 
                .Select(a => new ArtistDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    ProfileImageUrl = a.ProfileImageUrl,
                    IsVerified = a.IsVerified
                })
                .ToListAsync();

            var result = new PaginatedResultDto<ArtistDto>
            {
                Items = artists,
                TotalCount = totalCount,
                HasNextPage = (pageNumber * pageSize) < totalCount
            };

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ArtistDetailDto>> GetArtist(Guid id)
        {
            var artist = await _context.Artists
                .Include(a => a.Albums) 
                .Where(a => a.Id == id)
                .Select(a => new ArtistDetailDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Bio = a.Bio,
                    ProfileImageUrl = a.ProfileImageUrl,
                    IsVerified = a.IsVerified,
                    Albums = a.Albums.Select(album => new AlbumDto
                    {
                        Id = album.Id,
                        Title = album.Title,
                        CoverImageUrl = album.CoverImageUrl
                    }).ToList()
                })
                .FirstOrDefaultAsync(); 

            if (artist == null)
            {
                return NotFound();
            }

            return Ok(artist);
        }
    }
}