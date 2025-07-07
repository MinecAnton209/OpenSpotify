using System.ComponentModel.DataAnnotations;

namespace OpenSpotify.API.DTOs
{
    public class UpdateArtistProfileDto
    {
        [StringLength(1000)]
        public string? Bio { get; set; }
        
        [Url]
        [StringLength(500)]
        public string? ProfileImageUrl { get; set; }
    }
}