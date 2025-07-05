namespace OpenSpotify.API.DTOs
{
    public class ArtistDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsVerified { get; set; }
        
        public List<AlbumDto> Albums { get; set; } = new();
    }
}