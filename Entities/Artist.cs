using System.ComponentModel.DataAnnotations;

namespace OpenSpotify.API.Entities
{
    public class Artist
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsVerified { get; set; }

        public string? UserId { get; set; }
        public ApplicationUser? User { get; set; }

        public List<Album> Albums { get; set; } = new();
    }
}