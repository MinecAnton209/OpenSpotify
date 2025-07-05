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
        public async Task<ActionResult<IEnumerable<ArtistDto>>> GetArtists()
        {
            var artists = await _context.Artists
                .Select(a => new ArtistDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    ProfileImageUrl = a.ProfileImageUrl,
                    IsVerified = a.IsVerified
                })
                .ToListAsync();

            return Ok(artists);
        }
    }
}