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
    }
}