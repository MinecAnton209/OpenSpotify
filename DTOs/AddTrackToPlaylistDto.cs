using System.ComponentModel.DataAnnotations;

namespace OpenSpotify.API.DTOs
{
    public class AddTrackToPlaylistDto
    {
        [Required]
        public Guid TrackId { get; set; }
    }
}