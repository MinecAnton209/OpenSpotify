namespace OpenSpotify.API.DTOs
{
    public class AlbumDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        public string? CoverVideoUrl { get; set; }
        
        public Guid ArtistId { get; set; }
        public string ArtistName { get; set; } = null!;
        
        public List<TrackDto> Tracks { get; set; } = new();
    }
}