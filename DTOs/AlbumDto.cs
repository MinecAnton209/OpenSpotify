namespace OpenSpotify.API.DTOs
{
    public class AlbumDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        public string? CoverVideoUrl { get; set; }
    }
}