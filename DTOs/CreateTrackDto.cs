using System.ComponentModel.DataAnnotations;

namespace OpenSpotify.API.DTOs
{
    public class CreateTrackDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        [Range(1, 3600)]
        public int DurationInSeconds { get; set; }
    }
}