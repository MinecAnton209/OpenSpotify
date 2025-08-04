namespace OpenSpotify.API.DTOs
{
    public class TrackDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public int DurationInSeconds { get; set; }
        
        public string ArtistName { get; set; } = null!;
        public string? AlbumCoverImageUrl { get; set; }
        public string? CanvasVideoUrl { get; set; }
        
        public string? AudioUrl { get; set; }
        public string? AlbumName { get; set; } 
        public Guid AlbumId { get; set; }
    }
}