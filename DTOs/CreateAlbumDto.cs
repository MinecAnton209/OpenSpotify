using System.ComponentModel.DataAnnotations;

namespace OpenSpotify.API.DTOs
{
    public class CreateAlbumDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = null!;
        
        [Url]
        [StringLength(500)]
        public string? CoverImageUrl { get; set; }
    }
}