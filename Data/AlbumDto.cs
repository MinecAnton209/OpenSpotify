namespace OpenSpotify.API.DTOs
{
    public class AlbumDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
    }
}