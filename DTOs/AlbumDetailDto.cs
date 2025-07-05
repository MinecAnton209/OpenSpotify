namespace OpenSpotify.API.DTOs
{
    public class AlbumDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        
        public int ArtistId { get; set; }
        public string ArtistName { get; set; } = null!;
        
        public List<TrackDto> Tracks { get; set; } = new();
    }
}