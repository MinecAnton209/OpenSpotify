namespace OpenSpotify.API.DTOs
{
    public class ArtistDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? ProfileImageUrl { get; set; }
        public bool IsVerified { get; set; }
    }
}