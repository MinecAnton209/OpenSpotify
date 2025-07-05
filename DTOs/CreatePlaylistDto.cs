using System.ComponentModel.DataAnnotations;

namespace OpenSpotify.API.DTOs
{
    public class CreatePlaylistDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = null!;
    }
}